import json
import natsort
from rest_framework.views import APIView
from rest_framework.response import Response
from .functions import *
import pandas as pd

# All views are simple request/response constructs, taking
# parameters from the frontend, calculating something and returning it


class UploadView(APIView):
    def post(self, request, *args, **kwargs):
        response, success = try_upload(self.request.data['upload'])
        return Response(status=200, data={"success": success, "response": response})


class InfoView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data['upload'])
        if data is False:
            return Response(status=204)
        headers = column_headers(data)
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
        data = handle_upload(self.request.data['upload'])
        if data is False:
            return Response(status=204)
        # Load json stringified arrays
        id_list = json.loads(self.request.POST.get('id_list', None))
        mod1_list = json.loads(self.request.POST.get('mod1_list', None))
        min_edge_count = json.loads(self.request.data['min_edge_count'])
        
        return_data = {"graph": interaction_network(
            data, id_list, mod1_list, min_edge_count)}
        return Response(status=200, data=return_data)


class BehaviorPlotView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data['upload'])
        if data is False:
            return Response(status=204)
        behavior = self.request.data['behavior']
        # Load json stringified arrays
        id_list = json.loads(self.request.POST.get('id_list', None))
        bhvr_list = json.loads(self.request.POST.get('bhvr_list', None))
        return_data = {"plot": dataplot(data, behavior, id_list, bhvr_list)}
        return Response(status=200, data=return_data)


class TransitionView(APIView):
    def post(self, request, *args, **kwargs):
        data = handle_upload(self.request.data['upload'])
        if data is False:
            return Response(status=204)
        option = self.request.data['option']
        if (option == 'false'):
            option = 'behavior'
        else:
            option = 'behavioral_category'
        min_edge_count = json.loads(self.request.data['min_edge_count'])
        with_status = json.loads(self.request.data['with_status'])
        normalized = json.loads(self.request.data['normalized'])
        logarithmic_normalization = json.loads(self.request.data['logarithmic_normalization'])
        colored = json.loads(self.request.data['colored'])
        colored_edge_thickness = json.loads(
            self.request.data['colored_edge_thickness'])
        color_hue = json.loads(self.request.data['color_hue'])
        node_color_map = self.request.data['node_color_map']
        node_size_map = self.request.data['node_size_map']
        node_label_map = self.request.data['node_label_map']
        # Load json stringified arrays
        id_list = json.loads(self.request.POST.get('id_list', None))
        bhvr_list = json.loads(self.request.POST.get('bhvr_list', None))
        custom_edge_thickness = json.loads(self.request.data['custom_edge_thickness'])

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
                logarithmic_normalization
            )
        }
        return Response(status=200, data=return_data)
