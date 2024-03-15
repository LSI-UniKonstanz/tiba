from networkx.drawing.nx_pydot import to_pydot
import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import graphviz
import networkx as nx
import pandas as pd
import uuid
import math
import warnings
from .helpers import *

# ignore warnings if dataframe values are accessed by df["x"] instead of df.x
warnings.simplefilter(action="ignore", category=FutureWarning)
pd.options.mode.chained_assignment = None
# use Agg for image generation, it runs better on the backend server
matplotlib.use("Agg")

# django localhost to save images
localhost = "http://127.0.0.1:8000/"


def interaction_network(df, id_list, mod1_list, hue, node_color, node_size, threshold=1):
    """
    The interaction network displays the number and direction of interactions between individuals.
    It is a directed weighted network where edges are drawn from individual A to individual B if A is
    the subject of a behavior and B is the recipient (i.e. the corresponding value in the optional column Modifier).
    The number of interactions determines the weight of an edge.
    Individuals may be deselected and a weight threshold for edges to be displayed may be set.

    :param df: The dataframe containing the behavior data
    :param id_list: list of selected subjects (emanating behavior)
    :param mod1_list: list of selected modifiers (incoming behavior)
    :param color_hue: value on the color cycle
    :param node_color_map: map x \in [total time, average time, count of occurences] to node color saturation
    :param node_size_map: map x \in [total time, average time, count of occurences] to node size
    :param threshold: Threshold for edges to be displayed
    :return: URL where the generated image resides
    """
    print( hue, node_color, node_size)

    # Filter relevant columns
    interactions_df = df[df.modifier_1.notna()]
    interactions_df = interactions_df[["subject", "modifier_1"]]

    # Drop rows not in id_list
    if "dummy" not in id_list:
        interactions_df = interactions_df[interactions_df.subject.isin(id_list)]

    # Drop rows not in mod1_list
    if "dummy" not in mod1_list:
        interactions_df = interactions_df[interactions_df.modifier_1.isin(mod1_list)]

    # Create a dataframe for the edges
    edges_df = interactions_df.groupby(["subject", "modifier_1"]).size().reset_index(name="records")

    # Remove edges below the threshold
    edges_df = edges_df[edges_df.records >= threshold]

    # Prepare attributes for the network generation
    edges_df["tuples"] = list(zip(edges_df.subject, edges_df.modifier_1))
    edges_df["weight"] = edges_df.records * 3 / edges_df.records.max()

    # Set minimal value for edge penwidth so all edges are visible
    edges_df["weight"] = edges_df["weight"].apply(lambda x: max(0.2, x))

    # Create directed graph with networkx
    G = nx.DiGraph()
    G.add_edges_from(edges_df.tuples)
    
    #path = f"public/interactions/interactions-{uuid.uuid4().hex}"
    path = f"public/interactions/interactions-{uuid.uuid4().hex}"

    # Edge labels and weights
    edge_attributes_label = dict(zip(edges_df.tuples, edges_df.records))
    edge_attributes_label_inv = dict(zip(edges_df.tuples, 1/edges_df.records))
    edge_attributes_weight = dict(zip(edges_df.tuples, edges_df["weight"]))
    nx.set_edge_attributes(G, edge_attributes_label, name="label")
    nx.set_edge_attributes(G, edge_attributes_label_inv, name="label_inv")
    nx.set_edge_attributes(G, edge_attributes_weight, name="penwidth")

    # Create a DataFrame with ingoing and outgoing edges count and sum of edge labels for each ID
    node_data = []
    for node in G.nodes:
        ingoing_edges = G.in_edges(node, data=True)
        outgoing_edges = G.out_edges(node, data=True)

        ingoing_count = len(ingoing_edges)
        outgoing_count = len(outgoing_edges)
        ingoing_label_sum = sum(edge[2]['label'] for edge in ingoing_edges )
        outgoing_label_sum = sum(edge[2]['label'] for edge in outgoing_edges )
        
        # Calculate centrality measures
        in_centrality = nx.in_degree_centrality(G).get(node, 0)
        out_centrality = nx.out_degree_centrality(G).get(node, 0)
        total_centrality = nx.degree_centrality(G).get(node, 0)
        
        # Calculate additional centrality measures
        closeness_centrality = nx.closeness_centrality(G).get(node, 0)
        betweenness_centrality = nx.betweenness_centrality(G).get(node, 0)

        
        # Calculate additional centrality measures with inverse edge label as weight
        closeness_centrality_w_inv = nx.closeness_centrality(G, distance='label_inv').get(node, 0)
        betweenness_centrality_w_inv = nx.betweenness_centrality(G, weight='label_inv').get(node, 0)


        
        node_data.append({
            'ID': node,
            '#Ingoing': ingoing_label_sum,
            '#Outgoing': outgoing_label_sum,
            '#IngoingEdges': ingoing_count,
            '#OutgoingEdges': outgoing_count,
            'In-Deg.Cen.': in_centrality,
            'Out-Deg.Cen.': out_centrality,
            #'TotalCentrality': total_centrality,
            'Closen.Cen.': closeness_centrality,
            #'ClosenessCentrality incl. e.w. ': closeness_centrality_w_inv,
            'Between.Cen.': betweenness_centrality,
            #'BetweennessCentrality incl .e.w.': betweenness_centrality_w_inv,
        })

    statistics_df = pd.DataFrame(node_data)
    # Sort the DataFrame alphanumerically by the 'ID' column
    statistics_sorted = statistics_df.sort_values(by='ID', key=lambda x: x.map(alphanum_key))
    # Save the DataFrame to CSV
    statistics_sorted.to_csv(path + "-statistics.csv", index=False)
    
    # Map centralities to node size or color
    area_max = 0.2
    if node_size == "indeg":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['In-Deg.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "outdeg":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Out-Deg.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "betweenness":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Between.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "closeness":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Closen.Cen.'] * area_max / 2 * math.pi) 
    
    if node_size in ['indeg', 'outdeg', 'betweenness', 'closeness']:
        nodes_width = dict(zip(statistics_df['ID'], statistics_df.radius * 2))
        nodes_height = dict(zip(statistics_df['ID'], statistics_df.radius))
        nx.set_node_attributes(G, nodes_width, name="width")
        nx.set_node_attributes(G, nodes_height, name="height")

    hue = hue / 360
    if node_color == "indeg":
        statistics_df["color"] = str(hue) + " " + statistics_df['In-Deg.Cen.'].astype(str) + " 1"
    elif node_color == "outdeg":
        statistics_df["color"] = str(hue) + " " + statistics_df['Out-Deg.Cen.'].astype(str) + " 1"
    elif node_color == "betweenness":
        statistics_df["color"] = str(hue) + " " + statistics_df['Between.Cen.'].astype(str) + " 1"
    elif node_color == "closeness":
        statistics_df["color"] = str(hue) + " " + statistics_df['Closen.Cen.'].astype(str) + " 1"

    if node_color in ['indeg', 'outdeg', 'betweenness', 'closeness']:
        nodes_color = dict(zip(statistics_df['ID'], statistics_df.color))
        nx.set_node_attributes(G, nodes_color, name="fillcolor")
        nx.set_node_attributes(G, "filled", name="style")
        
    # Generate graphviz
    G_dot_string = to_pydot(G).to_string()
    G_dot = graphviz.Source(G_dot_string)
    G_dot.format = "svg"

    # Save image
    G_dot.render(path + ".gv", view=False)

    # Save graph as .gml
    nx.write_gml(G, path + ".gml")

    # Return URL where the image resides
    #url = path + ".gv.svg"
    url = localhost + path + ".gv.svg"
    
    return url

def dataplot(df, plot_categories, id_list, bhvr_list, separate):
    """
    The behavior graph displays the temporal occurrences of behavioral events.
    It maps values from the column Time to the x axis and the cumulative count of behaviors shown
    up to that time separately for each individual to the y axis.
    Individuals or individual behaviors may be deselected.

    `Required`
    :param df: Dataframe containing the behavior data
    :param behavior: The single behavior or behavioral category to plot
    :param id_list: list of selected subjects
    :param bhvr_list: list of selected behaviors
    :param cumulative: accumulate different behaviors for one individual
    """

    # Only use Starting behaviors to not double count
    df = df[df.status != "STOP"]

    # Init with behavior or behavioral category
    if (plot_categories==False):
        df['selected'] = df['behavior'].copy()
    else:
        df['selected'] = df['behavioral_category'].copy()

        
    # Hacky solution: if frontend has not yet initialized the id_list, then use all IDs
    if "dummy" in id_list:
        id_list = get_fish_ids(df)

    # Remove rows with unselected behaviors
    if "dummy" not in bhvr_list:
        df = df[df.selected.isin(bhvr_list)]

    # Init empty figure for the plot
    plt.close("all")
    fig = plt.figure(3, figsize=(15,8))
    ax = fig.subplots()
    highest_plot = 0
    plot_counter = 0

    plt.gca().set_prop_cycle(None)
    # loop over all fish_ids and plot their amount of selected interactions
    for fish in id_list:
        if (plot_counter >= 10):
            break     
        fish_df = df[df.subject == fish]    
        
        if(separate==True):   
            # Optionally split behavior lines for one individual
            for behvr in fish_df.selected.unique():
                if (plot_counter >= 10):
                    break

                behvr_df = fish_df[fish_df.selected == behvr]
                highest_plot = max(highest_plot, len(behvr_df) + 1)
                sum_of_rows = range(1,len(behvr_df)+1)
                # Create stair-like effect by duplicating x and y values
                x = []
                y = []
                for i in range(len(behvr_df)):
                    x.extend([behvr_df.time.iloc[i], behvr_df.time.iloc[i+1] if i+1 < len(behvr_df) else behvr_df.time.iloc[i]])
                    y.extend([sum_of_rows[i], sum_of_rows[i]])
                
                if len(sum_of_rows) > 0:
                    plot_counter += 1
                    line_color = plt.gca()._get_lines.get_next_color()
                    plt.plot([x[0], x[0]], [0, 1], color=line_color)
                    plt.plot(x, y, label=f"{fish} - {behvr}", color=line_color)
                    
        elif(separate==False):
            #if (plot_counter >= 10):
            #    break
            highest_plot = max(highest_plot, len(fish_df) + 1)
            sum_of_rows = range(1,len(fish_df) + 1)
            # Create stair-like effect by duplicating x and y values
            x = []
            y = []
            for i in range(len(fish_df)):
                x.extend([fish_df.time.iloc[i], fish_df.time.iloc[i+1] if i+1 < len(fish_df) else fish_df.time.iloc[i]])
                y.extend([sum_of_rows[i], sum_of_rows[i]])
            
            if len(sum_of_rows) > 0:
                plot_counter += 1
                line_color = plt.gca()._get_lines.get_next_color()
                plt.plot([x[0], x[0]], [0, 1], color=line_color)
                plt.plot(x, y, label=fish, color=line_color)
                
    # add legend and edge labels
    # Place the legend to the right and adjust the layout
    plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
    #plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
    plt.xlabel("Time (s)", fontsize=18, labelpad=10)
    plt.ylabel("Count of behavioral categories" if plot_categories else "Count of behaviors", fontsize=18, labelpad=10)

    ytick_frequency = determine_ytick_frequency(highest_plot)
    yticks = range(0, highest_plot, ytick_frequency)

    plt.yticks(yticks)
    plt.grid(linestyle="-", linewidth=0.2)

    # save image
    path = "public/plots/plot-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)

    # return url where image resides
    url = localhost + path

    return url

def barplot(df, id_list, bhvr_list, plot_categories=False, relative=False, plot_total_time=False):
    """
    The bar plot displays the count of occurrences for each distinct value in df['selected'] for a specific individual.
    
    `Required`
    :param df: Dataframe containing the behavior data
    :param id_list: List of selected subject ids
    :param bhvr_list: List of selected behaviors
    :param plot_categories: If True, use behavioral categories instead of behaviors as x-values
    :param relative: If True, normalize the bar heights to represent relative frequencies
    :param plot_total_time: If True, use total time as y-values
    """

    # Only use Starting behaviors to not double count if the records should be displayed
    if not plot_total_time:
        df = df[df.status != "STOP"]

    # Init with behavior or behavioral category
    if plot_categories:
        df['selected'] = df['behavioral_category'].copy()
        color_dict = map_values_to_color(df,True)

    else:
        df['selected'] = df['behavior'].copy()
        color_dict = map_values_to_color(df,False)

    if "dummy" in id_list:
        id_list = get_fish_ids(df)

    # Only keep rows for individuals in id_list
    individual_df = df[df['subject'].isin(id_list)]

    # Remove rows with unselected behaviors
    if "dummy" not in bhvr_list:
        individual_df = individual_df[individual_df.selected.isin(bhvr_list)]

    # Init empty figure for the plot
    plt.close("all")
    fig = plt.figure(1, figsize=(10,8))
    ax = fig.subplots()

    plt.gca().set_prop_cycle(None)

    # Initialize lists to hold values and labels for the pie chart
    pie_values = []
    pie_labels = []

    # Calculate figure size to determine available space for labels
    fig_size = ax.get_figure().get_size_inches()
    fig_width, fig_height = fig_size

    # Calculate total area available for labels
    total_area = fig_width * fig_height

    # Calculate total count for relative frequencies
    total_count = len(individual_df) if not plot_total_time else individual_df[individual_df.status == "STOP"].time.sum() - individual_df[individual_df.status == "START"].time.sum()

    # Loop over all distinct values in df['selected'] (e.g., df['behavior'])
    for i, value in enumerate(sorted(individual_df['selected'].unique())):
        if plot_total_time:
            stop_total = individual_df[(individual_df.status == "STOP") & (individual_df['selected'] == value)].time.sum()
            start_total = individual_df[(individual_df.status == "START") & (individual_df['selected'] == value)].time.sum()
            count = stop_total - start_total
        else:
            count = individual_df[individual_df['selected'] == value].shape[0]

        if relative:
            relative_count = count / total_count * 100
            # Append relative count and label to lists for pie chart
            pie_values.append(relative_count)
            pie_labels.append(f'{value} ({relative_count:.2f}%)')
        else:
            # Plot a bar for each distinct value with the count of occurrences
            if plot_total_time:
                ax.bar(value, count, label=f'{value} ({round(count,1)}s)', color=color_dict[value])
            else:
                ax.bar(value, count, label=f'{value} ({count})', color=color_dict[value])

    # If relative, plot pie chart
    if relative:
        plt.pie(pie_values, 
                labels=[x.split('(')[-2] if float(x.split('(')[-1].split('%')[0]) > 4 else '' for x in pie_labels], 
                autopct=lambda pct: '%1.2f%%' % pct if pct > 4 else '', 
                startangle=140, 
                colors=[color_dict[value] for value in sorted(individual_df['selected'].unique())])          
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
        plt.legend(loc='upper left', labels=pie_labels, bbox_to_anchor=(1, 1), title= "Behavioral categories" if plot_categories else "Behaviors" )
    # Else, configure bar chart
    else:
        # Set yticks, tetermine y-axis tick frequency based on the maximum value
        max_val = int(ax.get_ylim()[1])
        ytick_frequency = determine_ytick_frequency(max_val)
        plt.yticks(range(0, max_val + 1, ytick_frequency))
        plt.grid(axis='y', linestyle="-", linewidth=0.2)
        # Rotate x-tick labels by 45 degrees
        plt.xticks(rotation=45, ha='right')
        # Add legend and axis labels
        plt.legend(loc='upper left', bbox_to_anchor=(1, 1), title= "Behavioral categories" if plot_categories else "Behaviors" )

    if relative and not plot_total_time:
        plt.title("Relative count of behaviors" if plot_categories else "Relative count of behaviors", fontsize=18)
    if (not relative) and (not plot_total_time):
        plt.ylabel("Count", fontsize=16, labelpad=10)
        plt.title("Total count of behavioral categories" if plot_categories else "Total count of behaviors", fontsize=18)
    if not relative and plot_total_time:
        plt.title("Total duration of behavioral categories" if plot_categories else "Total duration of behaviors", fontsize=18)
        plt.ylabel("Duration (s)", fontsize=16, labelpad=10)
    if relative and plot_total_time:
        plt.title("Relative duration of behavioral categories" if plot_categories else "Relative duration of behavioral categories", fontsize=18)

    # save image
    path = "public/barplots/barplot-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)

    # return url where image resides
    url = localhost + path

    return url

def time_series(df,subject_id, bhvr_list, plot_categories):
    
    bhvr_list = sorted(bhvr_list)
    df_copy = df.copy()

    if subject_id == "dummy":
        subject_id = get_fish_ids(df)[0]

    # Init with behavior or behavioral category
    if plot_categories:
        df['selected'] = df['behavioral_category'].copy()
        color_dict = map_values_to_color(df,True)
    else:
        df['selected'] = df['behavior'].copy()
        color_dict = map_values_to_color(df,False)

    # Filter dataframe to include only the specified behaviors
    df = df[df['subject'] == subject_id]
    df = df[df['selected'].isin(bhvr_list)]
    
    # Create a figure and axis object with a wider size and fixed aspect ratio
    plt.close("all")
    fig = plt.figure(2, figsize=(15,5))
    ax = fig.subplots()
    ax.set_aspect(30) 
    
    # Create a dictionary to map behavior names to their corresponding positions
    behavior_positions = {bhvr: i for i, bhvr in enumerate(bhvr_list)}

    # Iterate over each behavior
    for behavior in bhvr_list:
        # Filter dataframe for the specific behavior
        behavior_df = df[df['selected'] == behavior]

        # Initialize start time
        start_time = None

        # Initialize flag to check if the behavior is shown
        behavior_shown = False

        # Iterate over each row in the filtered dataframe
        for index, row in behavior_df.iterrows():
            # Get the start and stop times for the behavior
            if row['status'] == 'START' and not behavior_shown:
                start_time = row['time']
                behavior_shown = True
                shown_behavior = row['behavior']
            elif row['status'] == 'STOP' and row['behavior'] == shown_behavior:
                stop_time = row['time']
                if behavior_shown:
                    # Plot a horizontal line for the behavior
                    ax.hlines(behavior_positions[behavior], start_time, stop_time, color=color_dict[row.selected], linewidth=15)
                behavior_shown = False
                start_time = None  # Reset start time after plotting


    # Plot thin grey horizontal lines at each ytick position
    for i in range(len(bhvr_list)):
        ax.axhline(y=i, color='grey', linestyle='--', linewidth=0.5)

    # Set y-axis ticks to display the behaviors
    ax.set_yticks(range(len(bhvr_list)))
    ax.set_yticklabels(bhvr_list)
    
    # Determine the range of behavior positions
    min_position = min(behavior_positions.values())
    max_position = max(behavior_positions.values())

    # Adjust the y-axis limits with some padding
    padding = 0.7  # Adjust this value as needed
    ax.set_ylim(min_position - padding, max_position + padding)
    # Set the x-axis limit to df.time.max()
    ax.set_xlim(right=df_copy.time.max(), left=df_copy.time.min())
    
    if plot_categories:
        ax.set_ylabel("Beh. Categories", fontsize=18, labelpad=10)
    else:
        ax.set_ylabel("Behaviors", fontsize=18, labelpad=10)
        
    ax.set_xlabel("Time (s)", fontsize=18, labelpad=10)        
    ax.set_title(f"Time budget chart for subject {subject_id}", fontsize=18)
    
    # save image
    path = "public/timeseries/timeseries-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)

    # return url where image resides
    url = localhost + path

    return url



def transition_network(
    df,
    option,
    min_edge_count,
    with_status,
    normalized,
    colored,
    colored_edge_thickness,
    color_hue,
    node_color_map,
    node_size_map,
    node_label_map,
    id_list,
    bhvr_list,
    custom_edge_thickness,
    logarithmic_normalization,
    for_comparison
):
    """
    The behavior transition network displays temporal sequences of behavioral events.
    It is a directed, weighted network where the nodes represent either behaviors or behavioral
    categories and edges represent the transition from one behavior to another. Either the number
    of transitions or the transitional frequencies, i.e. the relative frequency with which a
    certain behavior follows another behavior, may be used as edge weighting. Individual behaviors,
    behavioral categories or individuals may be deselected and thereby excluded from the calculation
    and visualization. Node appearance may be altered by mapping the total number of behaviors,
    the average or total time of behaviors to node size, node color saturation or a label inside the node.
    The width of drawn edges may either be fixed or dependent on the weights, also a threshold for
    edges to be displayed may be set. Edge width, node size and node saturation may be normalized either
    in a linear or logarithmic fashion. Two color options are available: either each node and its outgoing
    edges have distinctive colors or a color is set and the nodes differentiate in the color saturation dependent on the mapping.

    :param df: The dataframe containing the behavior data
    :param option: either behaviors or behavioral categories
    :param min_edge_count: Threshold for edges to be displayed
    :param with_status: Bool
    :param normalized: Bool
    :param colored: Bool
    :param colored_edge_thickness: Int
    :param color_hue: value on the color cycle
    :param node_color_map: map x \in [total time, average time, count of occurences] to node color saturation
    :param node_size_map: map x \in [total time, average time, count of occurences] to node size
    :param node_label_map: map x \in [total time, average time, count of occurences] to node label
    :param id_list: list of selected subjects (emanating behavior)
    :param bhvr: list of selected behavioral events
    :param custom_edge_thickness:
    :param logarithmic_normalization: Normalize logarithmically instead of linearly

    :return: url where svg image of graph is saved

    """

    # Set user specified params
    local_df = df
    # Behavior/Behavioral category
    data = option
    # Edge thickness
    multiplication_factor = colored_edge_thickness
    # OLD setting individual color per node in transition network
    behaviour_key = ""
    colour_value = ""
    # Minimal edge value
    min_count = min_edge_count
    # Node color, size and label
    hue = color_hue
    node_colour = node_color_map
    node_size = node_size_map
    node_label = node_label_map
    
    # category dependent coloring
    category_color_dict = map_values_to_color(df, True)

    # Hacky solution: if frontend has not yet initialized the id_list, then use all IDs
    if "dummy" in id_list:
        id_list = get_fish_ids(df)

    # Set user chosen column
    if data == "behavioral_category":
        # reset list of removed behaviors
        local_df["chosen_data"] = local_df["behavioral_category"]
    else:
        # reset list of removed behavioral categories
        local_df["chosen_data"] = local_df["behavior"]

    successor_list = []
    
    # Remove behaviors/categories that are unselected by the user
    if "dummy" not in bhvr_list:
        # Filter rows based on selected behaviors
        local_df = local_df[local_df.chosen_data.isin(bhvr_list)]

    # Loop through dataframe for each fish and add behavior and successor
    for fish in id_list:
        id_frame = local_df[local_df.subject == fish]
        id_frame = id_frame.drop(id_frame[id_frame.status == "STOP"].index)
        i = 0
        k = i + 1
        while i < len(id_frame) - 1:
            successor_list.append(
                (
                    id_frame.chosen_data.iloc[i],
                    id_frame.status.iloc[i],
                    id_frame.chosen_data.iloc[k],
                    id_frame.status.iloc[k],
                )
            )
            k += 1
            i += 1

    # lets make an edgelist with behavior and successor
    successor_df = pd.DataFrame(
        successor_list, columns=["action_1", "status_1", "action_2", "status_2"]
    )
    successor_df = successor_df.replace(to_replace="POINT", value="")

    successor_df["tuples"] = list(zip(successor_df.action_1, successor_df.action_2))
    successor_df = (
        successor_df.groupby(successor_df.columns.tolist())
        .size()
        .to_frame(name="records")
        .reset_index()
    )

    # normalize the records in [0,1] so that all together are 1 for each action
    behavior_ids = successor_df.action_1.unique().tolist()
    edges_df = pd.DataFrame()
    for action in behavior_ids:
        action_frame = successor_df[successor_df.action_1 == action]
        if normalized:
            sum_of_successors = action_frame.records.sum()
            action_frame["normalized"] = action_frame.records.div(
                sum_of_successors
            ).round(2)
            # action_frame['ln_normalized'] = (np.log(action_frame.records) / np.log(sum_of_successors)).round(2)
        edges_df = edges_df.append(action_frame)

    # erase edges below min_count
    try:
        if normalized and min_count:
            edges_df = edges_df[edges_df.normalized >= float(min_count)]
        elif not normalized and min_count:
            edges_df = edges_df[edges_df.records >= float(min_count)]
    except:
        pass


    # add average and total time
    times_list = get_total_time_and_category(local_df, id_list)
    times_df = pd.DataFrame(times_list, columns=["action_1", "total_time", "category"])

    # work on the nodes(behaviors) of the graph so we can later set node-attributes for graphviz
    nodes_df = edges_df[["action_1", "records"]]
    nodes_df = (
        edges_df.groupby("action_1")["records"]
        .sum()
        .to_frame(name="records")
        .reset_index()
    )

    nodes_df = pd.merge(times_df, nodes_df, on="action_1", how="outer")
    nodes_df.columns = ["node", "total_time", "category", "record"]
    # Assuming nodes_df is your DataFrame
    nodes_df["avg_time"] = np.where((nodes_df["record"] == 0) | (nodes_df["total_time"].isna()) | (nodes_df["record"].isna()),0,nodes_df["total_time"] / nodes_df["record"])
    # if a behavior occurs only once/ as last behavior maybe of an animal it is not counted

    nodes_df.record = nodes_df.record.fillna(1).astype(int)
    # round results
    nodes_df.total_time = nodes_df.total_time.round(2)
    nodes_df.avg_time = nodes_df.avg_time.round(2)
    

    # Change node label if user maps total/avg time or record to node label
    labels_1 = nodes_df.copy()
    labels_1.columns = ["action_1", "total_time_1", "category", "record_1", "avg_time_1"]
    edges_df = pd.merge(edges_df, labels_1, on="action_1", how="left")
    labels_2 = nodes_df.copy()
    labels_2.columns = ["action_2", "total_time_2", "category", "record_2", "avg_time_2"]
    edges_df = pd.merge(edges_df, labels_2, on="action_2", how="left")


    if node_label == "amount":
        edges_df["action_1"] = (
            edges_df["action_1"] + " - " + edges_df["record_1"].astype(str)
        )
        edges_df["action_2"] = (
            edges_df["action_2"] + " - " + edges_df["record_2"].astype(str)
        )
        edges_df["tuples"] = list(zip(edges_df["action_1"], edges_df["action_2"]))
        nodes_df["node"] = nodes_df["node"] + " - " + nodes_df["record"].astype(str)
    elif node_label == "total_time":
        edges_df["action_1"] = (
            edges_df["action_1"] + " - " + edges_df["total_time_1"].astype(str)
        )
        edges_df["action_2"] = (
            edges_df["action_2"] + " - " + edges_df["total_time_2"].astype(str)
        )
        edges_df["tuples"] = list(zip(edges_df["action_1"], edges_df["action_2"]))
        nodes_df["node"] = nodes_df["node"] + " - " + nodes_df["total_time"].astype(str)
    elif node_label == "avg_time":
        edges_df["action_1"] = (
            edges_df["action_1"] + " - " + edges_df["avg_time_1"].astype(str)
        )
        edges_df["action_2"] = (
            edges_df["action_2"] + " - " + edges_df["avg_time_2"].astype(str)
        )
        edges_df["tuples"] = list(zip(edges_df["action_1"], edges_df["action_2"]))
        nodes_df["node"] = nodes_df["node"] + " - " + nodes_df["avg_time"].astype(str)

    # Save dataframe with absolute (non-normalized) values
    save_nodes_df = nodes_df.copy()

    # logarithmic max-min normalization of record, avg_time and total_time
    if logarithmic_normalization:
        nodes_df.record = (np.log(nodes_df.record) - np.log(nodes_df.record.min())) / (
            np.log(nodes_df.record.max()) - np.log(nodes_df.record.min())
        )
        nodes_df.total_time = nodes_df.total_time + 1
        nodes_df.total_time = (
            np.log(nodes_df.total_time) - np.log(nodes_df.total_time.min())
        ) / (np.log(nodes_df.total_time.max()) - np.log(nodes_df.total_time.min()))
        nodes_df.avg_time = nodes_df.avg_time + 1
        nodes_df.avg_time = (
            np.log(nodes_df.avg_time) - np.log(nodes_df.avg_time.min())
        ) / (np.log(nodes_df.avg_time.max()) - np.log(nodes_df.avg_time.min()))

        nodes_attributes_avg_time = dict(zip(nodes_df.node, nodes_df.avg_time))
    # linear max-min normalization
    else:
        nodes_df.record = (nodes_df.record - nodes_df.record.min()) / (
            nodes_df.record.max() - nodes_df.record.min()
        )
        nodes_df.total_time = (nodes_df.total_time - nodes_df.total_time.min()) / (
            nodes_df.total_time.max() - nodes_df.total_time.min()
        )
        nodes_df.avg_time = (nodes_df.avg_time - nodes_df.avg_time.min()) / (
            nodes_df.avg_time.max() - nodes_df.avg_time.min()
        )
        nodes_attributes_avg_time = dict(zip(nodes_df.node, nodes_df.avg_time))

    # max area size
    area_max = 0.4

    # calculate node width and height: humans see the area! so the area needs to be proportional to the normalized value in [0..1]
    # we derive a formula: A_ellipse = a*b*PI
    if node_size == "amount":
        nodes_df["radius"] = 2 * np.sqrt(nodes_df.record * area_max / 2 * math.pi)
        nodes_width = dict(zip(nodes_df.node, nodes_df.radius * 2))
        nodes_height = dict(zip(nodes_df.node, nodes_df.radius))
    elif node_size == "total_time":
        nodes_df["radius"] = 2 * np.sqrt(nodes_df.total_time * area_max / 2 * math.pi)
        nodes_width = dict(zip(nodes_df.node, nodes_df.radius * 2))
        nodes_height = dict(zip(nodes_df.node, nodes_df.radius))
    elif node_size == "avg_time":
        nodes_df["radius"] = 2 * np.sqrt(nodes_df.avg_time * area_max / 2 * math.pi)
        nodes_width = dict(zip(nodes_df.node, nodes_df.radius * 2))
        nodes_height = dict(zip(nodes_df.node, nodes_df.radius))

    # node colour dependent on user input, values are normalized with np.log and then a dictionary
    # for node colour is created to give it to graphviz later
    hue = hue / 360
    if not colored:
        if node_colour == "amount":
            nodes_df["colour"] = str(hue) + " " + nodes_df["record"].astype(str) + " 1"
            nodes_colour = dict(zip(nodes_df.node, nodes_df.colour))
        elif node_colour == "total_time":
            nodes_df["colour"] = str(hue) + " " + nodes_df["total_time"].astype(str) + " 1"
            nodes_colour = dict(zip(nodes_df.node, nodes_df.colour))
        elif node_colour == "avg_time":
            nodes_df["colour"] = str(hue) + " " + nodes_df["avg_time"].astype(str) + " 1"
            nodes_colour = dict(zip(nodes_df.node, nodes_df.colour))

    # create directed graph
    G = nx.DiGraph()
    G.add_edges_from(edges_df.tuples)

    # create label and weight for edges
    if normalized:
        edge_attributes_label = dict(zip(edges_df.tuples, edges_df.normalized))
        edge_attributes_weight = dict(
            zip(edges_df.tuples, edges_df.normalized * multiplication_factor)
        )
        # if (logarithmic_normalization):
        #    edge_attributes_weight = dict(zip(edges_df.tuples, edges_df.normalized * multiplication_factor))

    else:
        edge_attributes_label = dict(zip(edges_df.tuples, edges_df.records))
        # normalize logarithmic
        if logarithmic_normalization:
            edges_df.records = (
                np.log(edges_df.records) - np.log(edges_df.records.min())
            ) / (np.log(edges_df.records.max()) - np.log(edges_df.records.min()))
            edges_df.records = edges_df.records + 0.1
        else:
            edges_df.records = (edges_df.records - edges_df.records.min()) / (
                edges_df.records.max() - edges_df.records.min()
            )

        # set edge weight, respecting the multiplication factor
        edge_attributes_weight = dict(
            zip(edges_df.tuples, multiplication_factor * edges_df.records)
        )
    
    # set minimal value for edge penwidth so all edges are visible
    if colored:
        for k, v in edge_attributes_weight.items():
            if v < 0.5:
                edge_attributes_weight[k] = 0.5
    else:
        for k, v in edge_attributes_weight.items():
            if v < 0.2:
                edge_attributes_weight[k] = 0.2

    # set edge attributes
    if custom_edge_thickness == False:
        nx.set_edge_attributes(G, edge_attributes_weight, name="penwidth")
        # print(edge_attributes_weight)
    nx.set_edge_attributes(G, edge_attributes_label, name="label")
    if (for_comparison):
        nx.set_edge_attributes(G, edge_attributes_label, name="weight")

    # set node attributes
    if not colored and node_colour in ['amount', 'total_time', 'avg_time']:
        nx.set_node_attributes(G, nodes_colour, name="fillcolor")
        nx.set_node_attributes(G, "filled", name="style")

        
    # Handle unique node coloring
    if colored:
        # Create a DataFrame with unique nodes and their corresponding behavioral category
        unique_nodes_df = save_nodes_df[['node', 'category']]

        # Convert RGBA to hexadecimal color code
        hex_colors = {key: matplotlib.colors.rgb2hex(value) for key, value in category_color_dict.items()}


        # Assign node colors based on the behavioral category
        node_colors = {node: hex_colors[category] for node, category in zip(unique_nodes_df['node'], unique_nodes_df['category'])}
        nx.set_node_attributes(G, node_colors, name="fillcolor")
        nx.set_node_attributes(G, "filled", name="style")

        # Assign edge colors based on the source node's behavioral category
        edges_df["edge_color"] = edges_df["action_1"].map(node_colors.get).fillna("white")
        distinct_edge_colors = dict(zip(edges_df.tuples, edges_df.edge_color))
        nx.set_edge_attributes(G, distinct_edge_colors, name="color")

        
    # add avg time as node attribute
    nx.set_node_attributes(G, nodes_attributes_avg_time, name="avg_time")

    # Create a DataFrame with ingoing and outgoing edges count and sum of edge labels for each ID
    node_data = []
    for node in G.nodes:
        ingoing_edges = G.in_edges(node, data=True)
        outgoing_edges = G.out_edges(node, data=True)

        ingoing_count = len(ingoing_edges)
        outgoing_count = len(outgoing_edges)
        ingoing_label_sum = sum(edge[2]['label'] for edge in ingoing_edges )
        outgoing_label_sum = sum(edge[2]['label'] for edge in outgoing_edges )

        # Calculate records, average_time and total_time 
        mask = save_nodes_df['node'] == node
        avg_time_value = save_nodes_df.loc[mask, 'avg_time'].values[0] if any(mask) else np.nan
        total_time_value = save_nodes_df.loc[mask, 'total_time'].values[0] if any(mask) else np.nan
        record_value = save_nodes_df.loc[mask, 'record'].values[0] if any(mask) else np.nan

        # Calculate centrality measures
        in_centrality = nx.in_degree_centrality(G).get(node, 0)
        out_centrality = nx.out_degree_centrality(G).get(node, 0)

        # Calculate additional centrality measures
        closeness_centrality = nx.closeness_centrality(G).get(node, 0)
        betweenness_centrality = nx.betweenness_centrality(G).get(node, 0)


        node_data.append({
            'ID': node,
            'AverageTime': avg_time_value,
            'TotalTime': total_time_value,
            '#Occurences': record_value,
            '#IngoingEdges': ingoing_count,
            '#OutgoingEdges': outgoing_count,
            'In-Deg.Cen.': in_centrality,
            'Out-Deg.Cen.': out_centrality,
            'Closen.Cen.': closeness_centrality,
            'Between.Cen.': betweenness_centrality,
        })

    statistics_df = pd.DataFrame(node_data)
    # Sort the DataFrame alphanumerically by the 'ID' column
    statistics_sorted = statistics_df.sort_values(by='ID', key=lambda x: x.map(alphanum_key))


    # Map centralities to node size or color
    if node_size == "indeg":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['In-Deg.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "outdeg":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Out-Deg.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "betweenness":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Between.Cen.'] * area_max / 2 * math.pi)
    elif node_size == "closeness":
        statistics_df["radius"] = 2 * np.sqrt(statistics_df['Closen.Cen.'] * area_max / 2 * math.pi) 
    
    if node_size in ['indeg', 'outdeg', 'betweenness', 'closeness']:
        nodes_width = dict(zip(statistics_df['ID'], statistics_df.radius * 2))
        nodes_height = dict(zip(statistics_df['ID'], statistics_df.radius))

    if not colored:
        if node_colour == "indeg":
            statistics_df["colour"] = str(hue) + " " + statistics_df['In-Deg.Cen.'].astype(str) + " 1"
        elif node_colour == "outdeg":
            statistics_df["colour"] = str(hue) + " " + statistics_df['Out-Deg.Cen.'].astype(str) + " 1"
        elif node_colour == "betweenness":
            statistics_df["colour"] = str(hue) + " " + statistics_df['Between.Cen.'].astype(str) + " 1"
        elif node_colour == "closeness":
            statistics_df["colour"] = str(hue) + " " + statistics_df['Closen.Cen.'].astype(str) + " 1"

        if node_colour in ['indeg', 'outdeg', 'betweenness', 'closeness']:
            nodes_colour = dict(zip(statistics_df['ID'], statistics_df.colour))
            nx.set_node_attributes(G, nodes_colour, name="fillcolor")
            nx.set_node_attributes(G, "filled", name="style")

    # set node attributes
    nx.set_node_attributes(G, nodes_width, name="width")
    nx.set_node_attributes(G, nodes_height, name="height")

    # graphviz
    G_dot_string = to_pydot(G).to_string()
    G_dot = graphviz.Source(G_dot_string)
    G_dot.format = "svg"

    # save image
    path = "public/transitions/transitions-" + uuid.uuid4().hex
    G_dot.render(path + ".gv", view=False)
    # save graph as .gml
    nx.write_gml(G, path + ".gml")

    # Save the DataFrame to CSV
    statistics_sorted.to_csv( path + "-statistics.csv", index=False)
    
    # return url where images is saved
    #playground
    #url =  path + ".gv.svg"
    url = localhost + path + ".gv.svg"
    
    return url