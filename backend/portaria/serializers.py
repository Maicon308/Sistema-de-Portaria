from rest_framework import serializers
from .models import RegistroVisitante

class RegistroVisitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroVisitante
        fields = '__all__'
        read_only_fields = ['data_entrada', 'horario_entrada', 'created_at', 'updated_at']
