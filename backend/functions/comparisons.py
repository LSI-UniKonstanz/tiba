import netrd
import networkx as nx
import itertools

def str_to_dist(s):
    """
    Takes a string and returns respective netrd distance object

    :param s: string representation of distance algorithm
    :return: netrd object of distance algorithm
    """
    match (s):
        case "JaccardDistance":
            return netrd.distance.JaccardDistance()
        case "PortraitDivergence":
            return netrd.distance.PortraitDivergence()
        case "Frobenius":
            return netrd.distance.Frobenius()
        case "Hamming":
            return netrd.distance.Hamming()

    return


def distances(networks, distance_alg):
    """
    Calculates pairwise graph distances

    :param networks: list of saved transition networks
    :param distance_alg: type of distance algorithm to apply
    :return: list of 3-tuples (first network, second network, distance)
    """
    distances = list()
    # get netrd.distance object from string
    distance_alg = str_to_dist(distance_alg)
    # take network names pairwise
    for a, b in itertools.combinations(networks, 2):
        # load networks as networkx objects
        n1 = nx.read_gml("public/transitions/" + a.split("/")[-1])
        n2 = nx.read_gml("public/transitions/" + b.split("/")[-1])
        # compare and save as (first network, second network, distance)
        d = distance_alg.dist(n1, n2)
        distances.append((a, b, d))

    return distances


