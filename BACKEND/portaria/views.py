# BACKEND/portaria/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q

from .models import (
    Visitante, Setor, Autorizador, Porteiro,
    EmpresaPrestadora, TipoServicoEnergia, FuncaoFreelancer,
    PrestadorServico, Freelancer, SaidaMaterial
)
from .serializers import (
    VisitanteEntradaSerializer, VisitanteListSerializer,
    SetorSerializer, AutorizadorSerializer,
    EmpresaPrestadoraSerializer, TipoServicoEnergiaSerializer, FuncaoFreelancerSerializer,
    PrestadorServicoEntradaSerializer, PrestadorServicoListSerializer, PrestadorServicoSaidaSerializer,
    FreelancerEntradaSerializer, FreelancerListSerializer,
    SaidaMaterialSerializer
)

# ============================================================================
# LOGIN
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_porteiro(request):
    matricula = request.data.get('matricula', '').strip()
    
    if not matricula:
        return Response({"error": "Matrícula não pode estar vazia."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        porteiro = Porteiro.objects.get(matricula=matricula)
        return Response({
            "porteiro": {"matricula": porteiro.matricula, "nome": porteiro.nome}
        }, status=status.HTTP_200_OK)
    except Porteiro.DoesNotExist:
        return Response({"error": f"Matrícula '{matricula}' não encontrada."}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# VIEWSETS AUXILIARES
# ============================================================================

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all().order_by('nome')
    serializer_class = SetorSerializer
    permission_classes = [AllowAny]


class AutorizadorViewSet(viewsets.ModelViewSet):
    queryset = Autorizador.objects.all().order_by('nome')
    serializer_class = AutorizadorSerializer
    permission_classes = [AllowAny]


class EmpresaPrestadoraViewSet(viewsets.ModelViewSet):
    queryset = EmpresaPrestadora.objects.all().order_by('nome')
    serializer_class = EmpresaPrestadoraSerializer
    permission_classes = [AllowAny]


class TipoServicoEnergiaViewSet(viewsets.ModelViewSet):
    queryset = TipoServicoEnergia.objects.all().order_by('nome')
    serializer_class = TipoServicoEnergiaSerializer
    permission_classes = [AllowAny]


class FuncaoFreelancerViewSet(viewsets.ModelViewSet):
    queryset = FuncaoFreelancer.objects.all().order_by('nome')
    serializer_class = FuncaoFreelancerSerializer
    permission_classes = [AllowAny]


# ============================================================================
# VISITANTE VIEWSET
# ============================================================================

class VisitanteViewSet(viewsets.ModelViewSet):
    queryset = Visitante.objects.all().select_related('setor_destino', 'autorizador', 'porteiro').order_by('-data_hora_entrada')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return VisitanteEntradaSerializer
        return VisitanteListSerializer

    def get_queryset(self):
        if self.action == 'ativos':
            return Visitante.objects.filter(data_hora_saida__isnull=True).select_related('setor_destino', 'autorizador', 'porteiro').order_by('-data_hora_entrada')
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        num_cracha = request.data.get('num_cracha', '').strip()
        documento = request.data.get('documento', '').strip()
        nome = request.data.get('nome', '').strip()
        
        # Validações
        if Visitante.objects.filter(num_cracha=num_cracha, data_hora_saida__isnull=True).exists():
            return Response({"error": f"❌ Cartão nº {num_cracha} já está em uso!"}, status=status.HTTP_400_BAD_REQUEST)
        
        visitante_existente = Visitante.objects.filter(documento=documento).first()
        if visitante_existente:
            nome_existente_normalizado = ' '.join(visitante_existente.nome.lower().split())
            nome_novo_normalizado = ' '.join(nome.lower().split())
            if nome_existente_normalizado != nome_novo_normalizado:
                return Response({"error": f"❌ O documento {documento} já está cadastrado para '{visitante_existente.nome}'."}, status=status.HTTP_400_BAD_REQUEST)
        
        if Visitante.objects.filter(Q(documento=documento) | Q(nome__iexact=nome), data_hora_saida__isnull=True).exists():
            return Response({"error": f"❌ {nome} já possui uma entrada ativa."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": f"✅ Entrada registrada com sucesso para {nome}!", "data": serializer.data}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def ativos(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def saida_por_cartao(self, request):
        num_cracha = request.data.get('num_cracha', '').strip()
        if not num_cracha:
            return Response({"error": "Número do cartão não pode estar vazio."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            visitante = Visitante.objects.get(num_cracha=num_cracha, data_hora_saida__isnull=True)
            visitante.data_hora_saida = timezone.now()
            visitante.save()
            return Response({"message": f"✅ Saída registrada com sucesso para {visitante.nome}!"}, status=status.HTTP_200_OK)
        except Visitante.DoesNotExist:
            return Response({"error": f"❌ Nenhum visitante ativo encontrado com o cartão nº {num_cracha}."}, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# PRESTADOR DE SERVIÇO VIEWSET
# ============================================================================

class PrestadorServicoViewSet(viewsets.ModelViewSet):
    queryset = PrestadorServico.objects.all().select_related('empresa', 'autorizador', 'porteiro').order_by('-data_hora_entrada')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return PrestadorServicoEntradaSerializer
        return PrestadorServicoListSerializer

    def get_queryset(self):
        if self.action == 'ativos':
            return PrestadorServico.objects.filter(data_hora_saida__isnull=True).select_related('empresa', 'autorizador', 'porteiro').order_by('-data_hora_entrada')
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def ativos(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def registrar_saida(self, request, pk=None):
        prestador = self.get_object()
        if prestador.data_hora_saida:
            return Response({"error": "Este prestador já registrou saída."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PrestadorServicoSaidaSerializer(prestador, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        prestador.data_hora_saida = timezone.now()
        serializer.save()
        
        return Response({"message": f"✅ Saída registrada com sucesso!"}, status=status.HTTP_200_OK)


# ============================================================================
# FREELANCER VIEWSET
# ============================================================================

class FreelancerViewSet(viewsets.ModelViewSet):
    queryset = Freelancer.objects.all().select_related('funcao', 'porteiro').order_by('-data_hora_entrada')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return FreelancerEntradaSerializer
        return FreelancerListSerializer

    def get_queryset(self):
        if self.action == 'ativos':
            return Freelancer.objects.filter(data_hora_saida__isnull=True).select_related('funcao', 'porteiro').order_by('-data_hora_entrada')
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def ativos(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def registrar_saida(self, request, pk=None):
        freelancer = self.get_object()
        if freelancer.data_hora_saida:
            return Response({"error": "Este freelancer já registrou saída."}, status=status.HTTP_400_BAD_REQUEST)
        
        freelancer.data_hora_saida = timezone.now()
        freelancer.save()
        return Response({"message": f"✅ Saída registrada para {freelancer.nome}!"}, status=status.HTTP_200_OK)


# ============================================================================
# SAÍDA DE MATERIAL VIEWSET
# ============================================================================

class SaidaMaterialViewSet(viewsets.ModelViewSet):
    queryset = SaidaMaterial.objects.all().select_related('autorizador', 'porteiro').order_by('-data_hora_saida')
    serializer_class = SaidaMaterialSerializer
    permission_classes = [AllowAny]