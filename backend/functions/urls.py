from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.UploadView.as_view()),
    path('infos/', views.InfoView.as_view()),
    path('interactions/', views.InteractionView.as_view()),
    path('behaviorplot/', views.BehaviorPlotView.as_view()),
    path('transitions/', views.TransitionView.as_view()),
]
