# BACKEND/portaria/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VisitanteViewSet, SetorViewSet, AutorizadorViewSet,
    EmpresaPrestadoraViewSet, TipoServicoEnergiaViewSet, FuncaoFreelancerViewSet,
    PrestadorServicoViewSet, FreelancerViewSet, SaidaMaterialViewSet,
    login_porteiro
)

router = DefaultRouter()
router.register(r'visitantes', VisitanteViewSet, basename='visitante')
router.register(r'prestadores', PrestadorServicoViewSet, basename='prestador')
router.register(r'freelancers', FreelancerViewSet, basename='freelancer')
router.register(r'saidas-material', SaidaMaterialViewSet, basename='saida-material')

router.register(r'setores', SetorViewSet, basename='setor')
router.register(r'autorizadores', AutorizadorViewSet, basename='autorizador')
router.register(r'empresas', EmpresaPrestadoraViewSet, basename='empresa')
router.register(r'tipos-servico-energia', TipoServicoEnergiaViewSet, basename='tipo-servico-energia')
router.register(r'funcoes-freelancer', FuncaoFreelancerViewSet, basename='funcao-freelancer')

urlpatterns = [
    path('', include(router.urls)),
    path('porteiros/login/', login_porteiro, name='login-porteiro'),
]