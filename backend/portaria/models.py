from django.db import models

class RegistroVisitante(models.Model):
    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('finalizado', 'Finalizado'),
    ]
    
    numero_cartao = models.CharField(max_length=50)
    nome_visitante = models.CharField(max_length=200)
    onde_vai = models.CharField(max_length=200)
    quem_autorizou = models.CharField(max_length=200)
    nome_porteiro = models.CharField(max_length=200)
    
    data_entrada = models.DateField(auto_now_add=True)
    horario_entrada = models.TimeField(auto_now_add=True)
    
    data_saida = models.DateField(null=True, blank=True)
    horario_saida = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Registro de Visitante'
        verbose_name_plural = 'Registros de Visitantes'
    
    def __str__(self):
        return f"Cartão {self.numero_cartao} - {self.nome_visitante}"
