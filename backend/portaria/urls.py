from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistroVisitanteViewSet

router = DefaultRouter()
router.register(r'registros', RegistroVisitanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
