import json
import natsort
from rest_framework.views import APIView
from rest_framework.response import Response
from .visualizations import *
from .comparisons import *
from .helpers import *
import pandas as pd

# All views are simple request/response constructs, taking
# parameters from the frontend, calculating something and returning it


class UploadView(APIView):
    def post(self, request, *args, **kwargs):
        response, success = try_upload(self.request.data["upload"])
        return Response(status=200, data={"success": success, "response": response})


class InfoView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data["upload"])
        if data is False:
            return Response(status=204)
        headers = data.columns.tolist()
        ids = get_fish_ids(data)
        modifier_1s = get_unique_modifier1s(data)
        behaviors = natsort.natsorted(data.behavior.unique().tolist())
        categories = natsort.natsorted(data.behavioral_category.unique().tolist())
        return_data = {
            "headers": headers,
            "ids": ids,
            "modifier_1s": modifier_1s,
            "behaviors": behaviors,
            "categories": categories,
        }

        return Response(status=200, data=return_data)


class InteractionView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data["upload"])
        if data is False:
            return Response(status=204)
        # Load json stringified arrays
        id_list = json.loads(self.request.POST.get("id_list", None))
        mod1_list = json.loads(self.request.POST.get("mod1_list", None))
        min_edge_count = json.loads(self.request.data["min_edge_count"])

        return_data = {
            "graph": interaction_network(data, id_list, mod1_list, min_edge_count)
        }
        return Response(status=200, data=return_data)


class BehaviorPlotView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data["upload"])
        if data is False:
            return Response(status=204)
        behavior = self.request.data["behavior"]
        # Load json stringified arrays
        id_list = json.loads(self.request.POST.get("id_list", None))
        bhvr_list = json.loads(self.request.POST.get("bhvr_list", None))
        return_data = {"plot": dataplot(data, behavior, id_list, bhvr_list)}
        return Response(status=200, data=return_data)


class DistanceView(APIView):
    def post(self, request, *args, **kwargs):
        # read input params
        list_A = json.loads(self.request.POST.get("groupA", None))
        distance_alg = self.request.data["distanceAlg"]
        setindices = json.loads(self.request.data["setindices"])

        # read params for mds
        random_state = json.loads(self.request.data["random_state"])
        n_init = json.loads(self.request.data["n_init"])

        # read params for hierarchical clustering
        linkage = self.request.data["linkage"]

        # get pairwise distances
        dists_edge_list = distances(list_A, distance_alg)

        # cluster distances and return image url
        image_url = mds(dists_edge_list, distance_alg, random_state, n_init, setindices)
        image2_url = hierarchical_cluster(dists_edge_list, distance_alg, linkage, setindices)
        image3_url = kmedoids_cluster(dists_edge_list, distance_alg)

        return Response(status=200, data={"image_url": image_url, "image2_url": image2_url, "image3_url": image3_url})


class TransitionView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data["upload"])
        if data is False:
            return Response(status=204)

        # init empty vars
        min_edge_count = 0
        with_status = False
        normalized = False
        colored = False
        colored_edge_thickness = 2
        color_hue = 150
        node_color_map = "total_time"
        node_size_map = "total_time"
        node_label_map = "total_time"
        id_list = ["dummy"]
        bhvr_list = ["dummy"]
        custom_edge_thickness = False
        logarithmic_normalization = False

        # set customizations if present
        if "option" in self.request.data:
            option = self.request.data["option"]
        if option == "false":
            option = "behavior"
        else:
            option = "behavioral_category"
        if "min_edge_count" in self.request.data:
            min_edge_count = json.loads(self.request.data["min_edge_count"])
        if "with_status" in self.request.data:
            with_status = json.loads(self.request.data["with_status"])
        if "normalized" in self.request.data:
            normalized = json.loads(self.request.data["normalized"])
        if "logarithmic_normalization" in self.request.data:
            logarithmic_normalization = json.loads(
                self.request.data["logarithmic_normalization"]
            )
        if "colored" in self.request.data:
            colored = json.loads(self.request.data["colored"])
        if "colored_edge_thickness" in self.request.data:
            colored_edge_thickness = json.loads(
                self.request.data["colored_edge_thickness"]
            )
        if "color_hue" in self.request.data:
            color_hue = json.loads(self.request.data["color_hue"])
        if "node_color_map" in self.request.data:
            node_color_map = self.request.data["node_color_map"]
        if "node_size_map" in self.request.data:
            node_size_map = self.request.data["node_size_map"]
        if "node_label_map" in self.request.data:
            node_label_map = self.request.data["node_label_map"]
        # Load json stringified arrays
        if "id_list" in self.request.data:
            id_list = json.loads(self.request.POST.get("id_list", None))
        if "bhvr_list" in self.request.data:
            bhvr_list = json.loads(self.request.POST.get("bhvr_list", None))
        if "custom_edge_thickness" in self.request.data:
            custom_edge_thickness = json.loads(
                self.request.data["custom_edge_thickness"]
            )

        return_data = {
            "graph": transition_network(
                data,
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
            )
        }
        return Response(status=200, data=return_data)
