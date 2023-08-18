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


def interaction_network(
    df,
    id_list,
    mod1_list,
    threshold=1,
):
    """
    The interaction network displays the number and direction of interactions between individuals.
    It is a directed weighted network where edges are drawn from individual A to individual B if A is
    the subject of a behavior and B is the recipient (i.e. the corresponding value in the optional column Modifier).
    The number of interactions determines the weight of an edge.
    Individuals may be deselected and a weight threshold for edges to be displayed may be set.

    :param df: The dataframe containing the behavior data
    :param id_list: list of selected subjects (emanating behavior)
    :param mod1_list: list of selecte modifiers (incoming behavior)
    :threshold: Threshold for edges to be displayed

    """

    # remove behavior with no interaction partner and irrelevant data
    interactions_df = df[df.modifier_1.notna()]
    interactions_df = interactions_df[["subject", "modifier_1"]]

    # Drop rows which include unselected Subjects
    remove_id_list = []
    if "dummy" not in id_list:
        remove_id_list = [
            x for x in interactions_df.subject.unique() if x not in id_list
        ]
        for x in remove_id_list:
            interactions_df = interactions_df.drop(
                interactions_df[interactions_df.subject == x].index
            )

    # Drop rows which include unselected Modifier 1s
    remove_mod1_list = []
    if "dummy" not in mod1_list:
        remove_mod1_list = [
            x for x in interactions_df.modifier_1.unique() if x not in mod1_list
        ]
        for x in remove_mod1_list:
            interactions_df = interactions_df.drop(
                interactions_df[interactions_df.modifier_1 == x].index
            )

    # create a dataframe for the edges
    edges_df = (
        interactions_df.groupby(["subject", "modifier_1"])
        .size()
        .to_frame(name="records")
        .reset_index()
    )

    # remove edges below the threshold
    edges_df = edges_df[edges_df.records >= threshold]

    # add tuples and records as attributes for the network generation
    edges_df["tuples"] = list(zip(edges_df.subject, edges_df.modifier_1))
    edge_attributes_label = dict(zip(edges_df.tuples, edges_df.records))

    # change for edge weight
    edges_df.records = edges_df.records * 3 / edges_df.records.max()
    edge_attributes_weight = dict(zip(edges_df.tuples, edges_df.records))

    # set minimal value for edge penwidth so all edges are visible
    for k, v in edge_attributes_weight.items():
        if v < 0.2:
            edge_attributes_weight[k] = 0.2

    # create directed graph with networkx
    G = nx.DiGraph()
    G.add_edges_from(edges_df.tuples)

    # edge labels
    nx.set_edge_attributes(G, edge_attributes_label, name="label")

    # edge weight
    nx.set_edge_attributes(G, edge_attributes_weight, name="penwidth")

    # graphviz
    G_dot_string = to_pydot(G).to_string()
    G_dot = graphviz.Source(G_dot_string)
    G_dot.format = "svg"

    # save image
    path = "public/interactions/interactions-" + uuid.uuid4().hex
    G_dot.render(path + ".gv", view=False)

    # save graph as .gml
    nx.write_gml(G, path + ".gml")

    # return url where image resides
    url = localhost + path + ".gv.svg"

    return url


def dataplot(df, behavior, id_list, bhvr_list):
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
    """

    # Only use Starting behaviors to not double count
    df = df[df.status != "STOP"]

    # Hacky solution: if frontend has not yet initialized the id_list, then use all IDs
    if "dummy" in id_list:
        id_list = get_fish_ids(df)

    # Init empty figure for the plot
    fig = plt.figure(figsize=(9, 7))
    average = pd.DataFrame()
    highest_plot = 0

    remove_bhvr_list = []
    # Init list with behaviors to remove from dataframes
    if "dummy" not in bhvr_list:
        remove_bhvr_list = [x for x in df.behavior.unique() if x not in bhvr_list]

    plt.gca().set_prop_cycle(None)
    # loop over all fish_ids and plot their amount of selected interactions
    for fish in id_list:
        fish_df = df[df.subject == fish]

        # Remove rows with unselected behaviors
        for x in remove_bhvr_list:
            fish_df = fish_df.drop(fish_df[fish_df.behavior == x].index)

        if len(fish_df) + 1 > highest_plot:
            highest_plot = len(fish_df) + 1
        sum_of_rows = range(1, len(fish_df) + 1)
        plt.plot(fish_df.time, sum_of_rows, label=fish)

    plt.gca().set_prop_cycle(None)

    # loop over all fish ids and make the beginning  before the first behavior of the fish
    # loop over all fish_ids and plot their amount of selected interactions
    for fish in id_list:
        fish_df = df[df.subject == fish]
        # Remove rows with unselected behaviors
        for x in remove_bhvr_list:
            fish_df = fish_df.drop(fish_df[fish_df.behavior == x].index)

        plt.plot([0, fish_df.time.min()], [0, 1])

    # add legend and edge labels
    plt.legend()
    plt.xlabel("Time", fontsize=18, labelpad=10)
    plt.ylabel("Number of selected events", fontsize=18, labelpad=10)

    # make frequency of yticks dependent on size of the highest plot
    if highest_plot < 11:
        yticks = range(0, highest_plot)
    elif highest_plot < 26:
        yticks = range(0, highest_plot, 2)
    elif highest_plot < 51:
        yticks = range(0, highest_plot, 5)
    elif highest_plot < 101:
        yticks = range(0, highest_plot, 10)
    elif highest_plot < 201:
        yticks = range(0, highest_plot, 20)
    else:
        yticks = range(0, highest_plot, 50)
    plt.yticks(yticks)
    plt.grid(linestyle="-", linewidth=0.2)

    # save image
    path = "public/plots/plot-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    plt.close("all")

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
    sort_by = "amount"

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
    # Remove behaviors/categories which are unselected by the user
    if "dummy" not in bhvr_list:
        remove_bhvr_list = [
            x for x in local_df.chosen_data.unique() if x not in bhvr_list
        ]
        for x in remove_bhvr_list:
            local_df = local_df.drop(df[df.chosen_data == x].index)

    # Loop through dataframe for each fish and add behavior and successor
    for fish in id_list:
        id_frame = local_df[local_df.subject == fish]
        if not (with_status):
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
    if with_status:
        successor_df["plain_behavior"] = successor_df["action_1"]
        successor_df["action_1"] = (
            successor_df["action_1"] + " " + successor_df["status_1"]
        )
        successor_df["action_2"] = (
            successor_df["action_2"] + " " + successor_df["status_2"]
        )
    else:
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
    times_list = get_total_and_avg_time(df, id_list)
    times_df = pd.DataFrame(times_list, columns=["action_1", "total_time", "avg_time"])

    # work on the nodes(behaviors) of the graph so we can later set node-attributes for graphviz
    nodes_df = edges_df[["action_1", "records"]]
    nodes_df = (
        edges_df.groupby("action_1")["records"]
        .sum()
        .to_frame(name="records")
        .reset_index()
    )
    nodes_df = pd.merge(times_df, nodes_df, on="action_1", how="outer")
    nodes_df.columns = ["node", "total_time", "avg_time", "record"]

    # if a behavior occurs only once/ as last behavior maybe of an animal it is not counted
    if not (with_status):
        nodes_df.record = nodes_df.record.fillna(1)
    # round results
    nodes_df.total_time = nodes_df.total_time.round(2)
    nodes_df.avg_time = nodes_df.avg_time.round(2)

    # merge nodes with amount and times in the dataframe for the tuples so
    # they can be displayed inside the node as label
    labels_1 = nodes_df.copy()
    labels_1.columns = ["action_1", "total_time_1", "avg_time_1", "record_1"]
    edges_df = pd.merge(edges_df, labels_1, on="action_1", how="left")
    labels_2 = nodes_df.copy()
    labels_2.columns = ["action_2", "total_time_2", "avg_time_2", "record_2"]
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

    if sort_by == "amount":
        nodes_df = nodes_df.sort_values(by="record", ascending=False)
    elif sort_by == "total_time":
        nodes_df = nodes_df.sort_values(by="total_time", ascending=False)
    else:
        nodes_df = nodes_df.sort_values(by="avg_time", ascending=False)

    # print behavior nodes and amount

    # lineare normalisierung einbauen -> Fläche soll entsprechen

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
    nx.set_node_attributes(G, nodes_width, name="width")
    nx.set_node_attributes(G, nodes_height, name="height")
    if not with_status:
        nx.set_node_attributes(G, nodes_colour, name="fillcolor")
    nx.set_node_attributes(G, "filled", name="style")
    # create list with all nodes and give each a distinct color
    if colored:
        unique_nodes = nodes_df.node
        color_list = [
            "orangered1",
            "orange1",
            "orchid1",
            "palegreen",
            "paleturquoise4",
            "slategray3",
            "darkseagreen2",
            "yellowgreen",
            "burlywood",
            "khaki",
            "red",
            "gold",
            "turquoise",
            "darkgoldenrod2",
            "deeppink2",
            "silver",
            "aqua",
            "bisque",
            "aquamarine2",
            "beige",
            "azure4",
        ]

        try:
            unique_node_colours
        except NameError:
            var_exists = False
        else:
            var_exists = True

        if not (var_exists):
            unique_node_colours = dict(zip(unique_nodes, color_list))

        if behaviour_key:
            unique_node_colours[behaviour_key] = colour_value

        nx.set_node_attributes(G, unique_node_colours, name="fillcolor")
        # give same color to all edges outgoing from the same node
        edges_df["edge_color"] = "white"
        for key in unique_node_colours.keys():
            edges_df["edge_color"] = np.where(
                edges_df["action_1"] == key,
                unique_node_colours.get(key),
                edges_df["edge_color"],
            )

        distinct_edge_colors = dict(zip(edges_df.tuples, edges_df.edge_color))
        nx.set_edge_attributes(G, distinct_edge_colors, name="color")

    # add avg time as node attribute
    nx.set_node_attributes(G, nodes_attributes_avg_time, name="avg_time")

    # graphviz
    G_dot_string = to_pydot(G).to_string()
    G_dot = graphviz.Source(G_dot_string)
    G_dot.format = "svg"

    # save image
    path = "public/transitions/transitions-" + uuid.uuid4().hex
    G_dot.render(path + ".gv", view=False)

    # save graph as .gml
    nx.write_gml(G, path + ".gml")

    # return url where images is saved
    location = localhost + path + ".gv.svg"

    return location
