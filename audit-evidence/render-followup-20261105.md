# Render — verificação após confirmação do workspace

Data: 2026-11-05. Operações de leitura; nenhuma alteração de serviço, deploy ou segredo.
Esta nota atualiza o bloqueio de acesso descrito na auditoria inicial: o utilizador confirmou o workspace e a consulta ficou disponível.

|Campo|Produção|Staging|
|---|---|---|
|Serviço|jm-api-vault|jm-api-vault-shopping-staging|
|Região|Frankfurt|Frankfurt|
|Plano do serviço|free|free|
|Branch configurada|main|feat/shopping-coupons-providers|
|Deploy automático|Ativo, por commit|Desligado|
|Commit do deployment LIVE|74265843bee40630847fd2e36ffbbe29737b3c56|17bcc27223f801a0ab341bac850456086429ab82|
|Deploy terminado|2026-10-17 23:11:50 UTC|2026-10-13 22:51:01 UTC|
|healthCheckPath|vazio|vazio|
|Suspensão|not_suspended|not_suspended|

Ambos usam `cd api-vault && npm install` e `cd api-vault && npm start`.
O campo buildPlan é starter, mas o plano dos serviços é free; não foi inferido qualquer novo custo.

A consulta de eventos dos últimos sete dias, filtrada por server_failed, server_restarted, service_suspended e pipeline_minutes_exhausted, devolveu zero eventos em ambos. Isto não prova ausência de interrupções fora desse período ou noutros tipos de eventos.

A consulta filtrada de logs de build para identificar a versão Node falhou em ambos: HTTP 503, `failed to query loki: log retrieval is currently unavailable`. A versão efetivamente utilizada não foi confirmada.

## Divergência antes de qualquer integração

Comparação GitHub: base staging `17bcc27223f801a0ab341bac850456086429ab82`, head de correções `822d69c8b450d28582457c90f241e5c186f662d9`.
Resultado `diverged`, 30 commits exclusivos do head e 18 exclusivos da base; ancestral comum `b395118d9223a6f1ce62883a87cdd548fc2f8cf1`.
A lista de ficheiros de compare é relativa ao ancestral comum, não uma comparação direta dos dois diretórios. Não permite concluir que as alterações exclusivas de staging estão ausentes funcionalmente na outra branch.

Não se deve substituir a branch de staging ou fazer merge cego: é necessária reconciliação do conteúdo e testes isolados. As correções continuam apenas na branch de revisão, não nos serviços.

## Limites e próximo passo

Não foram consultados valores de variáveis, nem feitas chamadas autenticadas aos fornecedores. LIVE é estado do deployment; não prova funcionamento das integrações. Os resultados HTTP da auditoria anterior mantêm a sua data original, não foram apresentados como novos testes.

O ambiente de execução local desta conversa foi marcado indisponível neste turno, pelo que não foram executados novos testes locais. Os 43 testes da auditoria inicial pertencem à execução anterior.

Próximas ações: reconciliar staging em cópia isolada quando a execução estiver disponível; confirmar runtime pelos logs quando o serviço de logs recuperar; submeter configuração de health check e eventual deploy a autorização específica.
