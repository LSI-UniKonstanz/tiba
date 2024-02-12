from django.urls import path
from . import views

# reachable APIs, each is handling a request for calculation or information from the frontend
urlpatterns = [
    path('upload/', views.UploadView.as_view()),
    path('infos/', views.InfoView.as_view()),
    path('interactions/', views.InteractionView.as_view()),
    path('behaviorplot/', views.BehaviorPlotView.as_view()),
    path('barplot/', views.BarplotView.as_view()),
    path('timeseries/', views.TimeSeriesView.as_view()),
    path('transitions/', views.TransitionView.as_view()),
    path('distances/', views.DistanceView.as_view()),
]
