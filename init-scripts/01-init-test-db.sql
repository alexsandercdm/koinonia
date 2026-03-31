-- Script para criação do banco de dados de testes localmente

-- Criar o usuário 'test'
CREATE USER test WITH PASSWORD 'test';

-- Criar a base de dados 'koinonia_test' com owner 'test'
CREATE DATABASE koinonia_test OWNER test;

-- Conceder todos os privilégios ao usuário 'test' sobre a base de dados de teste
GRANT ALL PRIVILEGES ON DATABASE koinonia_test TO test;
