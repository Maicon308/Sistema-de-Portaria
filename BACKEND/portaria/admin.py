# BACKEND/portaria/admin.py

from django.contrib import admin
from .models import (
    Porteiro, Visitante, Setor, Autorizador,
    EmpresaPrestadora, TipoServicoEnergia, FuncaoFreelancer,
    PrestadorServico, Freelancer, SaidaMaterial
)

# ============================================================================
# CADASTROS BASE
# ============================================================================

@admin.register(Porteiro)
class PorteiroAdmin(admin.ModelAdmin):
    list_display = ('matricula', 'nome')
    search_fields = ('matricula', 'nome')


@admin.register(Setor)
class SetorAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)


@admin.register(Autorizador)
class AutorizadorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'setor')
    list_filter = ('setor',)
    search_fields = ('nome',)


@admin.register(EmpresaPrestadora)
class EmpresaPrestadoraAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'cnpj')
    list_filter = ('tipo',)
    search_fields = ('nome', 'cnpj')


@admin.register(TipoServicoEnergia)
class TipoServicoEnergiaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'empresa')
    list_filter = ('empresa',)
    search_fields = ('nome',)


@admin.register(FuncaoFreelancer)
class FuncaoFreelancerAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)


# ============================================================================
# REGISTROS PRINCIPAIS
# ============================================================================

@admin.register(Visitante)
class VisitanteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'documento', 'num_cracha', 'setor_destino', 'data_hora_entrada', 'data_hora_saida', 'porteiro')
    list_filter = ('setor_destino', 'autorizador', 'data_hora_entrada')
    search_fields = ('nome', 'documento', 'num_cracha')
    date_hierarchy = 'data_hora_entrada'


@admin.register(PrestadorServico)
class PrestadorServicoAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'nome_responsavel', 'tipo_servico', 'data_hora_entrada', 'data_hora_saida', 'porteiro')
    list_filter = ('empresa', 'tipo_servico_energia', 'veiculo_tipo', 'retira_material', 'data_hora_entrada')
    search_fields = ('nome_responsavel', 'matricula_responsavel', 'documento_responsavel', 'tipo_servico')
    date_hierarchy = 'data_hora_entrada'


@admin.register(Freelancer)
class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('nome', 'documento', 'funcao', 'data_hora_entrada', 'data_hora_saida', 'porteiro')
    list_filter = ('funcao', 'data_hora_entrada')
    search_fields = ('nome', 'documento')
    date_hierarchy = 'data_hora_entrada'


@admin.register(SaidaMaterial)
class SaidaMaterialAdmin(admin.ModelAdmin):
    list_display = ('numero_nf_almox', 'autorizador', 'prestador', 'data_hora_saida', 'porteiro')
    list_filter = ('autorizador', 'data_hora_saida')
    search_fields = ('numero_nf_almox', 'observacao')
    date_hierarchy = 'data_hora_saida'