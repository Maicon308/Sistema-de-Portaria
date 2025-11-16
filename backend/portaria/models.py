# BACKEND/portaria/models.py

from django.db import models
from django.utils import timezone

# ============================================================================
# MODELOS BASE - CADASTROS AUXILIARES
# ============================================================================

class Setor(models.Model):
    """Setores da empresa (RH, TI, Diretoria, etc.)"""
    nome = models.CharField(max_length=50, unique=True, verbose_name="Nome do Setor")
    
    class Meta:
        verbose_name = "Setor"
        verbose_name_plural = "Setores"
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Autorizador(models.Model):
    """Pessoas que podem autorizar visitas/entradas"""
    nome = models.CharField(max_length=100, verbose_name="Nome do Autorizador")
    setor = models.ForeignKey(
        Setor, 
        on_delete=models.CASCADE, 
        related_name='autorizadores', 
        verbose_name="Setor Principal"
    )

    class Meta:
        verbose_name = "Autorizador"
        verbose_name_plural = "Autorizadores"
        unique_together = ('nome', 'setor')
        ordering = ['setor__nome', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.setor.nome})"


class Porteiro(models.Model):
    """Porteiros do sistema"""
    matricula = models.CharField(max_length=20, unique=True, primary_key=True)
    nome = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Porteiro"
        verbose_name_plural = "Porteiros"

    def __str__(self):
        return f"{self.nome} ({self.matricula})"


class EmpresaPrestadora(models.Model):
    """Empresas prestadoras de serviço (CEEE, EQUATORIAL, etc.)"""
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Empresa")
    cnpj = models.CharField(max_length=18, blank=True, null=True, verbose_name="CNPJ")
    tipo = models.CharField(
        max_length=50,
        choices=[
            ('ENERGIA', 'Energia (CEEE/EQUATORIAL)'),
            ('LIMPEZA', 'Limpeza'),
            ('SEGURANCA', 'Segurança'),
            ('MANUTENCAO', 'Manutenção'),
            ('TI', 'TI/Tecnologia'),
            ('OUTROS', 'Outros'),
        ],
        default='OUTROS',
        verbose_name="Tipo de Empresa"
    )
    
    class Meta:
        verbose_name = "Empresa Prestadora"
        verbose_name_plural = "Empresas Prestadoras"
        ordering = ['nome']

    def __str__(self):
        return self.nome


class TipoServicoEnergia(models.Model):
    """Tipos de serviço para empresas de energia (ALTA, PROGEN, etc.)"""
    nome = models.CharField(max_length=50, unique=True, verbose_name="Nome do Tipo")
    empresa = models.ForeignKey(
        EmpresaPrestadora,
        on_delete=models.CASCADE,
        related_name='tipos_servico',
        verbose_name="Empresa"
    )
    
    class Meta:
        verbose_name = "Tipo de Serviço (Energia)"
        verbose_name_plural = "Tipos de Serviço (Energia)"
        ordering = ['empresa__nome', 'nome']

    def __str__(self):
        return f"{self.nome} - {self.empresa.nome}"


class FuncaoFreelancer(models.Model):
    """Funções para freelancers/diaristas (Limpeza, Pátio, Portaria, etc.)"""
    nome = models.CharField(max_length=50, unique=True, verbose_name="Nome da Função")
    
    class Meta:
        verbose_name = "Função (Freelancer)"
        verbose_name_plural = "Funções (Freelancer)"
        ordering = ['nome']

    def __str__(self):
        return self.nome


# ============================================================================
# MODELO: VISITANTE
# ============================================================================

class Visitante(models.Model):
    """Visitantes comuns"""
    nome = models.CharField(max_length=194, verbose_name="Nome Completo") 
    documento = models.CharField(max_length=20, verbose_name="RG ou CPF") 
    motivo = models.CharField(max_length=255, verbose_name="Motivo da Visita", blank=True, null=True) 
    num_cracha = models.CharField(max_length=10, verbose_name="Número do Crachá") 
    
    setor_destino = models.ForeignKey(Setor, on_delete=models.PROTECT, verbose_name="Setor de Destino")
    autorizador = models.ForeignKey(Autorizador, on_delete=models.PROTECT, verbose_name="Pessoa que Autorizou")
    
    data_hora_entrada = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora de Entrada")
    data_hora_saida = models.DateTimeField(null=True, blank=True, verbose_name="Data/Hora de Saída") 
    
    porteiro = models.ForeignKey(Porteiro, on_delete=models.PROTECT, verbose_name="Porteiro Responsável", to_field='matricula')

    class Meta:
        verbose_name = "Visitante"
        verbose_name_plural = "Visitantes"
        ordering = ['-data_hora_entrada']

    def __str__(self):
        return self.nome


# ============================================================================
# MODELO: PRESTADOR DE SERVIÇO
# ============================================================================

class PrestadorServico(models.Model):
    """Prestadores de serviço (empresas externas)"""
    # Dados da empresa/prestador
    empresa = models.ForeignKey(EmpresaPrestadora, on_delete=models.PROTECT, verbose_name="Empresa Prestadora")
    empresa_particular = models.CharField(max_length=100, blank=True, null=True, verbose_name="Nome Empresa Particular (se não for Equatorial)")
    
    # Dados do responsável (quem fica com o cartão)
    nome_responsavel = models.CharField(max_length=194, verbose_name="Nome do Responsável")
    num_cracha_prestador = models.CharField(max_length=10, verbose_name="Número do Crachá/Cartão")
    
    # Tipo de Serviço: MANUTENCAO ou RETIRADA_MATERIAL
    categoria_servico = models.CharField(
        max_length=20,
        choices=[
            ('MANUTENCAO', 'Manutenção'),
            ('RETIRADA_MATERIAL', 'Retirada de Materiais'),
        ],
        default='MANUTENCAO',
        verbose_name="Categoria do Serviço"
    )
    tipo_servico = models.CharField(max_length=200, verbose_name="Descrição do Serviço", help_text="Ex: Ar Condicionado, Pedreiro, Elétrica, etc.")
    
    # Autorização (entrada)
    autorizador = models.ForeignKey(Autorizador, on_delete=models.PROTECT, verbose_name="Quem Autorizou a Entrada")
    setor_destino = models.ForeignKey(Setor, on_delete=models.PROTECT, verbose_name="Setor de Destino", null=True, blank=True)
    
    # Datas
    data_hora_entrada = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora de Entrada")
    data_hora_saida = models.DateTimeField(null=True, blank=True, verbose_name="Data/Hora de Saída")
    
    # Campos específicos para RETIRADA DE MATERIAL
    autorizador_saida_material = models.ForeignKey(
        Autorizador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='autorizacoes_saida_material_prestador',
        verbose_name="Quem Autorizou a Retirada de Material"
    )
    setor_saida_material = models.ForeignKey(
        Setor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='saidas_material_prestador',
        verbose_name="Setor (Retirada de Material)"
    )
    veiculo_tipo_saida = models.CharField(
        max_length=20,
        choices=[
            ('CARRO', 'Carro'),
            ('MOTO', 'Moto'),
            ('VAN', 'Van'),
            ('BICICLETA', 'Bicicleta'),
            ('CAMINHAO', 'Caminhão'),
            ('NENHUM', 'Sem veículo'),
        ],
        blank=True,
        null=True,
        verbose_name="Tipo de Veículo (Retirada)"
    )
    veiculo_placa_saida = models.CharField(max_length=10, blank=True, null=True, verbose_name="Placa do Veículo (Retirada)")
    
    # Porteiro
    porteiro = models.ForeignKey(Porteiro, on_delete=models.PROTECT, verbose_name="Porteiro Responsável", to_field='matricula')

    class Meta:
        verbose_name = "Prestador de Serviço"
        verbose_name_plural = "Prestadores de Serviço"
        ordering = ['-data_hora_entrada']

    def __str__(self):
        empresa_nome = self.empresa_particular if self.empresa_particular else self.empresa.nome
        return f"{empresa_nome} - {self.nome_responsavel}"


class AcompanhantePrestador(models.Model):
    """Acompanhantes do prestador de serviço"""
    prestador = models.ForeignKey(
        PrestadorServico,
        on_delete=models.CASCADE,
        related_name='acompanhantes',
        verbose_name="Prestador"
    )
    nome = models.CharField(max_length=194, verbose_name="Nome do Acompanhante")
    documento = models.CharField(max_length=20, verbose_name="RG ou CPF")
    
    class Meta:
        verbose_name = "Acompanhante (Prestador)"
        verbose_name_plural = "Acompanhantes (Prestador)"
        
    def __str__(self):
        return f"{self.nome} - {self.documento}"


# ============================================================================
# MODELO: FREELANCER/DIARISTA
# ============================================================================

class Freelancer(models.Model):
    """Freelancers e diaristas da SETUP"""
    nome = models.CharField(max_length=194, verbose_name="Nome Completo")
    documento = models.CharField(max_length=20, verbose_name="RG ou CPF")
    funcao = models.ForeignKey(FuncaoFreelancer, on_delete=models.PROTECT, verbose_name="Função")
    
    data_hora_entrada = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora de Entrada")
    data_hora_saida = models.DateTimeField(null=True, blank=True, verbose_name="Data/Hora de Saída")
    
    porteiro = models.ForeignKey(Porteiro, on_delete=models.PROTECT, verbose_name="Porteiro Responsável", to_field='matricula')

    class Meta:
        verbose_name = "Freelancer/Diarista"
        verbose_name_plural = "Freelancers/Diaristas"
        ordering = ['-data_hora_entrada']

    def __str__(self):
        return f"{self.nome} - {self.funcao.nome}"


# ============================================================================
# MODELO: SAÍDA DE MATERIAL
# ============================================================================

class SaidaMaterial(models.Model):
    """Registro de saída de materiais do almoxarifado"""
    numero_nf_almox = models.CharField(max_length=50, verbose_name="Nº NF do Almoxarifado")
    autorizador = models.ForeignKey(Autorizador, on_delete=models.PROTECT, verbose_name="Quem Autorizou a Saída")
    
    # Opcional: vincular a um prestador
    prestador = models.ForeignKey(
        PrestadorServico,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Prestador (se aplicável)"
    )
    
    observacao = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    data_hora_saida = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora de Saída")
    porteiro = models.ForeignKey(Porteiro, on_delete=models.PROTECT, verbose_name="Porteiro Responsável", to_field='matricula')

    class Meta:
        verbose_name = "Saída de Material"
        verbose_name_plural = "Saídas de Material"
        ordering = ['-data_hora_saida']

    def __str__(self):
        return f"NF {self.numero_nf_almox} - {self.data_hora_saida.strftime('%d/%m/%Y')}"