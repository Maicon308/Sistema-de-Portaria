# 🏢 Sistema de Controle de Portaria

Sistema web para controle de visitantes com entrega de cartões.

## 🚀 Tecnologias

- **Backend**: Django 5.0 + Django REST Framework
- **Frontend**: React 18 + Vite
- **Banco de Dados**: SQLite

## 📋 Funcionalidades

- ✅ Registro de entrada de visitantes com entrega de cartão
- ✅ Registro de saída por número do cartão
- ✅ Listagem de visitantes ativos
- ✅ Relatório completo de registros
- ✅ Registro de data/horário de entrada e saída
- ✅ Informações: número do cartão, destino, autorizante e porteiro

## 🔧 Instalação

### Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

## 📊 Endpoints da API

- `GET /api/registros/` - Lista todos os registros
- `POST /api/registros/` - Cria novo registro de entrada
- `GET /api/registros/ativos/` - Lista visitantes ativos
- `POST /api/registros/registrar_saida/` - Registra saída por número do cartão

## 📝 Dados Registrados

**Entrada:**
- Número do cartão
- Nome do visitante
- Onde vai (setor/sala)
- Quem autorizou
- Nome do porteiro
- Data e horário de entrada (automático)

**Saída:**
- Número do cartão
- Data e horário de saída (automático)

## 👨‍💻 Desenvolvedor
 
