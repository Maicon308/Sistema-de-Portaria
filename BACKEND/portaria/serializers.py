# BACKEND/portaria/serializers.py

from rest_framework import serializers
from .models import (
    Visitante, Setor, Autorizador, Porteiro,
    EmpresaPrestadora, TipoServicoEnergia, FuncaoFreelancer,
    PrestadorServico, Freelancer, SaidaMaterial
)

# ============================================================================
# SERIALIZERS BASE
# ============================================================================

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'


class AutorizadorSerializer(serializers.ModelSerializer):
    setor_nome = serializers.CharField(source='setor.nome', read_only=True)
    
    class Meta:
        model = Autorizador
        fields = ['id', 'nome', 'setor', 'setor_nome']


class EmpresaPrestadoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaPrestadora
        fields = '__all__'


class TipoServicoEnergiaSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source='empresa.nome', read_only=True)
    
    class Meta:
        model = TipoServicoEnergia
        fields = ['id', 'nome', 'empresa', 'empresa_nome']


class FuncaoFreelancerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuncaoFreelancer
        fields = '__all__'


# ============================================================================
# VISITANTE SERIALIZERS
# ============================================================================

class VisitanteEntradaSerializer(serializers.ModelSerializer):
    porteiro = serializers.SlugRelatedField(
        slug_field='matricula', 
        queryset=Porteiro.objects.all()
    )
    
    class Meta:
        model = Visitante
        fields = [
            'nome', 'documento', 'num_cracha', 
            'setor_destino', 'autorizador', 'motivo', 'porteiro'
        ]


class VisitanteListSerializer(serializers.ModelSerializer):
    setor_destino_nome = serializers.CharField(source='setor_destino.nome', read_only=True)
    autorizador_nome = serializers.CharField(source='autorizador.nome', read_only=True)
    porteiro_nome = serializers.CharField(source='porteiro.nome', read_only=True)
    
    class Meta:
        model = Visitante
        fields = [
            'id', 'nome', 'documento', 'num_cracha', 'motivo',
            'setor_destino', 'setor_destino_nome',
            'autorizador', 'autorizador_nome',
            'porteiro_nome', 'data_hora_entrada', 'data_hora_saida'
        ]


# ============================================================================
# PRESTADOR DE SERVIÇO SERIALIZERS
# ============================================================================

class PrestadorServicoEntradaSerializer(serializers.ModelSerializer):
    porteiro = serializers.SlugRelatedField(
        slug_field='matricula', 
        queryset=Porteiro.objects.all()
    )
    
    class Meta:
        model = PrestadorServico
        fields = [
            'empresa', 'tipo_servico_energia',
            'nome_responsavel', 'matricula_responsavel', 'documento_responsavel',
            'acompanhantes', 'quem_solicitou', 'autorizador', 'tipo_servico',
            'veiculo_tipo', 'veiculo_placa', 'veiculo_motorista',
            'porteiro'
        ]


class PrestadorServicoListSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source='empresa.nome', read_only=True)
    tipo_servico_energia_nome = serializers.CharField(source='tipo_servico_energia.nome', read_only=True)
    autorizador_nome = serializers.CharField(source='autorizador.nome', read_only=True)
    autorizador_saida_nome = serializers.CharField(source='autorizador_saida.nome', read_only=True)
    porteiro_nome = serializers.CharField(source='porteiro.nome', read_only=True)
    
    class Meta:
        model = PrestadorServico
        fields = '__all__'


class PrestadorServicoSaidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrestadorServico
        fields = [
            'retira_material', 'autorizador_saida',
            'veiculo_saida_nome', 'veiculo_saida_modelo', 'veiculo_saida_placa',
            'numero_nf_autorizacao'
        ]


# ============================================================================
# FREELANCER SERIALIZERS
# ============================================================================

class FreelancerEntradaSerializer(serializers.ModelSerializer):
    porteiro = serializers.SlugRelatedField(
        slug_field='matricula', 
        queryset=Porteiro.objects.all()
    )
    
    class Meta:
        model = Freelancer
        fields = ['nome', 'documento', 'funcao', 'porteiro']


class FreelancerListSerializer(serializers.ModelSerializer):
    funcao_nome = serializers.CharField(source='funcao.nome', read_only=True)
    porteiro_nome = serializers.CharField(source='porteiro.nome', read_only=True)
    
    class Meta:
        model = Freelancer
        fields = [
            'id', 'nome', 'documento',
            'funcao', 'funcao_nome',
            'porteiro_nome', 'data_hora_entrada', 'data_hora_saida'
        ]


# ============================================================================
# SAÍDA DE MATERIAL SERIALIZERS
# ============================================================================

class SaidaMaterialSerializer(serializers.ModelSerializer):
    porteiro = serializers.SlugRelatedField(
        slug_field='matricula', 
        queryset=Porteiro.objects.all()
    )
    autorizador_nome = serializers.CharField(source='autorizador.nome', read_only=True)
    porteiro_nome = serializers.CharField(source='porteiro.nome', read_only=True)
    
    class Meta:
        model = SaidaMaterial
        fields = [
            'id', 'numero_nf_almox', 'autorizador', 'autorizador_nome',
            'prestador', 'observacao',
            'data_hora_saida', 'porteiro', 'porteiro_nome'
        ]