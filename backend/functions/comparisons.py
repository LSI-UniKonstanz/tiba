import netrd
import networkx as nx
import itertools
import numpy as np
import uuid
import scipy

# multidimensional scaling
from sklearn import manifold  
import matplotlib

# kmedoids
from sklearn_extra.cluster import KMedoids

# hierarchical clustering
from scipy.spatial.distance import squareform
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage

# plotting
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# django localhost to save images
localhost = "http://127.0.0.1:8000/"

def str_to_dist(s):
    """
    Takes a string and returns respective netrd distance object.

    :param s: string representation of distance algorithm
    :return: netrd object of distance algorithm
    """
    match (s):
        case "PortraitDivergence":
            return netrd.distance.PortraitDivergence()
        case "JaccardDistance":
            return netrd.distance.JaccardDistance()
        case "DistributionalNBD":
            return netrd.distance.DistributionalNBD()
        case "Frobenius":
            return netrd.distance.Frobenius()
        case "Hamming":
            return netrd.distance.Hamming()        
        case "IpsenMikhailov":
            return netrd.distance.IpsenMikhailov()
        case "PolynomialDissimilarity":
            return netrd.distance.PolynomialDissimilarity()    
        case "DegreeDivergence":
            return netrd.distance.DegreeDivergence()                 

    return


def distances(networks, distance_alg):
    """
    Calculates pairwise graph distances for {(a,b) | a,b \in networks}

    :param networks: list of saved transition networks
    :param distance_alg: type of distance algorithm to apply
    :return: list of 3-tuples (first network, second network, distance)
    """
    distances = list()
    # get netrd.distance object from string
    dist = str_to_dist(distance_alg)
    # take network names pairwise
    for a, b in itertools.combinations(networks, 2):
        # load networks as networkx objects
        n1 = nx.read_gml("public/transitions/" + a.split("/")[-1])
        n2 = nx.read_gml("public/transitions/" + b.split("/")[-1])
        # add nodes that are only present in one graph to the other if distance algorithm requires it
        if distance_alg in ["Hamming", "Frobenius", "PolynomialDissimilarity"]:
            n1.add_nodes_from(np.setdiff1d(n2.nodes(), n1.nodes()))
            n2.add_nodes_from(np.setdiff1d(n1.nodes(), n2.nodes()))
        # compare and save as 3-tuple (first network, second network, distance)
        d = dist.dist(n1, n2)
        distances.append((a, b, d))

    return distances


def edgelist_to_dist_matrix(edge_list):
    # Create a dictionary to map node names to matrix indices
    node_dict = {}
    count = 0
    for edge in edge_list:
        for node in edge[:2]:
            if node not in node_dict:
                node_dict[node] = count
                count += 1
    # Initialize the matrix with zeros
    dist_matrix = [[0 for j in range(count)] for i in range(count)]
    # Populate the matrix with edge weights
    for edge in edge_list:
        i = node_dict[edge[0]]
        j = node_dict[edge[1]]
        dist_matrix[i][j] = edge[2]
        dist_matrix[j][i] = edge[2]

    return dist_matrix, node_dict

def create_graph(dist_matrix, node_dict, distance_alg, setindices):
    # Convert the distance matrix to a NetworkX graph
    G = nx.Graph()
    for i, u in enumerate(node_dict.keys()):
        for j, v in enumerate(node_dict.keys()):
            if i != j:
                G.add_edge(u, v, weight=dist_matrix[i][j])

    node_labels = {k: k[0:2] for k in node_dict.keys()}

    # Get unique labels
    unique_labels = list(set(node_labels.values()))

    # Assign colors to labels
    label_colors = {label: f"C{i}" for i, label in enumerate(unique_labels)}

    # Get color for each node based on its label
    node_colors = [label_colors[node_labels[node]] for node in G.nodes()]

    # Create a 3D plot
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Generate node positions using spring layout
    pos = nx.spring_layout(G, dim=3, weight='weight')

    # Plot the nodes
    for node, color in zip(G.nodes(), node_colors):
        x, y, z = pos[node]
        ax.scatter(x, y, z, color=color)
        ax.text(x, y, z, node_labels[node], color='k', fontsize=8)

    # Plot the edges with lengths scaled by weights
    for u, v, w in G.edges.data('weight'):
        x1, y1, z1 = pos[u]
        x2, y2, z2 = pos[v]
        edge_length = 1 / w  # Invert the edge weight
        ax.plot([x1, x2], [y1, y2], [z1, z2], 'k-', linewidth=edge_length, alpha=0)

    # Set axis labels
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')

    # Set the first perspective
    ax.view_init(elev=30, azim=45)
    plt.title(f"Front", fontsize=14, pad=20)

    # Save and return image
    path = "public/comparisons/comparisons-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    url1 = localhost + path

    # Set the second perspective
    ax.view_init(elev=30, azim=80)
    plt.title(f"Right", fontsize=14, pad=20)

    # Save and return image
    path = "public/comparisons/comparisons-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    url2 = localhost + path

    # Set the third perspective
    ax.view_init(elev=80, azim=45)
    plt.title(f"Above", fontsize=14, pad=20)

    # Save and return image
    path = "public/comparisons/comparisons-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    url3 = localhost + path

    plt.close("all")

    return (url1,url2,url3)



def hierarchical_cluster(dist_matrix, node_dict, distance_alg, linkage_method="average", setindices=False, color_threshold=0.2):
    # Convert the distance matrix to a condensed distance matrix
    dist_condensed = squareform(dist_matrix)

    # Apply hierarchical clustering to the condensed distance matrix
    clustering = AgglomerativeClustering(
        distance_threshold=0, n_clusters=None, linkage=linkage_method, metric='precomputed'
    ).fit(dist_matrix)

    # get data labels
    labels = [key[0:2] for key in node_dict.keys()]
    
    # append label-dependent indices to labels
    if (setindices):
        counts = {}
        result = []

        for val in labels:
            if val not in counts:
                counts[val] = 1
            else:
                counts[val] += 1
            result.append(f"{val}{counts[val]}")
        
        labels = result

    # get the current figure and adjust its size
    fig = plt.gcf()
    fig.set_size_inches(fig.get_size_inches() * 1.2) # scale by 20

    # Plot the dendrogram of the clustering
    plt.title(f"Dendrogram for {distance_alg} distances across transition networks", fontsize=14, pad=20)
    plt.xlabel("Index")
    plt.ylabel("Distance")
    dendrogram(linkage(dist_condensed, method=linkage_method), labels=labels, truncate_mode="level", color_threshold=color_threshold)
    
    # save and return image
    path = "public/comparisons/comparisons-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    url = localhost + path
    plt.close("all")

    return url


def mds(dist_matrix, node_dict, distance_alg, random_state=0, n_init=4, setindices=False):
    """
    Uses multidimensional scaling to visualize the distances provided in the edge list

    :edgelist: 3-tuple ()
    :param cluster_alg:
    :return: image url
    """

    # init mds model
    mds_model = manifold.MDS(
        n_components=2, random_state=random_state, n_init=n_init, dissimilarity="precomputed", metric=False
    )
    mds_fit = mds_model.fit(dist_matrix)
    mds_coords = mds_model.fit_transform(dist_matrix)

    # init mpl figure
    f = plt.figure()
    # plt.scatter(mds_coords[:, 0], mds_coords[:, 1])
    labels = [key[0:2] for key in node_dict.keys()]

    # Create a list of colors corresponding to the labels list. Each unique labels gets a unique color.
    unique_vals = list(set(labels))
    colors = ['red', 'blue', 'green', 'orange', 'purple', 'brown', 'pink', 'gray', 'olive', 'cyan']
    color_dict = {val: colors[i] for i, val in enumerate(unique_vals)}
    color_list = [color_dict[val] for val in labels]

    # append label-dependent indices to labels
    if (setindices):
        counts = {}
        result = []

        for val in labels:
            if val not in counts:
                counts[val] = 1
            else:
                counts[val] += 1
            result.append(f"{val}{counts[val]}")
        
        labels = result

    plt.scatter(mds_coords[:, 0], mds_coords[:, 1], c=color_list, alpha=0.9)

    for label, x, y in zip(labels, mds_coords[:, 0], mds_coords[:, 1]):
        plt.annotate(label, (x, y), xycoords="data")

    plt.xlabel("First Dimension")
    plt.ylabel("Second Dimension")
    plt.title(f"MDS embedding of {distance_alg} distances across transition networks", fontsize=14, pad=20)

    # get the current figure and adjust its size
    fig = plt.gcf()
    fig.set_size_inches(fig.get_size_inches() * 1.2) # scale by 20

    # save and return image
    path = "public/comparisons/comparisons-" + uuid.uuid4().hex + ".svg"
    plt.savefig(path, format="svg", bbox_inches="tight")
    url = localhost + path

    plt.close("all")

    return (url,labels)