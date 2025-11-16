from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import RegistroVisitante
from .serializers import RegistroVisitanteSerializer

class RegistroVisitanteViewSet(viewsets.ModelViewSet):
    queryset = RegistroVisitante.objects.all()
    serializer_class = RegistroVisitanteSerializer
    
    @action(detail=False, methods=['get'])
    def ativos(self, request):
        ativos = self.queryset.filter(status='ativo')
        serializer = self.get_serializer(ativos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def registrar_saida(self, request):
        numero_cartao = request.data.get('numero_cartao')
        
        if not numero_cartao:
            return Response(
                {'error': 'Número do cartão é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            registro = RegistroVisitante.objects.filter(
                numero_cartao=numero_cartao,
                status='ativo'
            ).latest('created_at')
            
            registro.data_saida = timezone.now().date()
            registro.horario_saida = timezone.now().time()
            registro.status = 'finalizado'
            registro.save()
            
            serializer = self.get_serializer(registro)
            return Response(serializer.data)
            
        except RegistroVisitante.DoesNotExist:
            return Response(
                {'error': f'Cartão {numero_cartao} não encontrado ou já finalizado'},
                status=status.HTTP_404_NOT_FOUND
            )
