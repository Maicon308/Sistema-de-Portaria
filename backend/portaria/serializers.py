# BACKEND/portaria/serializers.py

from rest_framework import serializers
from .models import (
    Visitante, Setor, Autorizador, Porteiro,
    EmpresaPrestadora, TipoServicoEnergia, FuncaoFreelancer,
    PrestadorServico, AcompanhantePrestador, Freelancer, SaidaMaterial
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

class AcompanhantePrestadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcompanhantePrestador
        fields = ['id', 'nome', 'documento']


class PrestadorServicoEntradaSerializer(serializers.ModelSerializer):
    porteiro = serializers.SlugRelatedField(
        slug_field='matricula', 
        queryset=Porteiro.objects.all()
    )
    acompanhantes = AcompanhantePrestadorSerializer(many=True, required=False)
    
    class Meta:
        model = PrestadorServico
        fields = [
            'empresa', 'empresa_particular',
            'nome_responsavel', 'num_cracha_prestador',
            'categoria_servico', 'tipo_servico',
            'autorizador', 'setor_destino',
            'autorizador_saida_material', 'setor_saida_material',
            'veiculo_tipo_saida', 'veiculo_placa_saida',
            'porteiro', 'acompanhantes'
        ]
    
    def create(self, validated_data):
        acompanhantes_data = validated_data.pop('acompanhantes', [])
        prestador = PrestadorServico.objects.create(**validated_data)
        
        for acomp_data in acompanhantes_data:
            AcompanhantePrestador.objects.create(prestador=prestador, **acomp_data)
        
        return prestador


class PrestadorServicoListSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source='empresa.nome', read_only=True)
    autorizador_nome = serializers.CharField(source='autorizador.nome', read_only=True)
    autorizador_saida_material_nome = serializers.CharField(source='autorizador_saida_material.nome', read_only=True)
    setor_destino_nome = serializers.CharField(source='setor_destino.nome', read_only=True)
    setor_saida_material_nome = serializers.CharField(source='setor_saida_material.nome', read_only=True)
    porteiro_nome = serializers.CharField(source='porteiro.nome', read_only=True)
    acompanhantes = AcompanhantePrestadorSerializer(many=True, read_only=True)
    
    class Meta:
        model = PrestadorServico
        fields = '__all__'


class PrestadorServicoSaidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrestadorServico
        fields = ['id', 'data_hora_saida']


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