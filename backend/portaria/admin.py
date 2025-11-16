from django.contrib import admin
from .models import RegistroVisitante

@admin.register(RegistroVisitante)
class RegistroVisitanteAdmin(admin.ModelAdmin):
    list_display = ['numero_cartao', 'nome_visitante', 'onde_vai', 'status', 'data_entrada', 'horario_entrada']
    list_filter = ['status', 'data_entrada']
    search_fields = ['numero_cartao', 'nome_visitante', 'onde_vai', 'quem_autorizou']
    readonly_fields = ['created_at', 'updated_at']
