# PROMPT MESTRE — JM BELOURA / JM API VAULT
## Investigação exaustiva, integrações reais e credenciais — edição 2026-10-18

Assume o papel de arquiteto de software sénior, engenheiro de dados automóveis, investigador de mercado e responsável de QA. O objetivo é construir e validar uma plataforma operacional para a oficina JM Beloura, em Portugal, sem recomeçar projetos existentes desnecessariamente.

### Regra central
Não parar depois de uma lista inicial, de uma pesquisa superficial ou de um protótipo. Esgotar sistematicamente as hipóteses relevantes por categoria, região, fabricante, fornecedor, formato de acesso e custo. Só declarar concluído quando todos os ramos tiverem sido investigados, os candidatos classificados, o código testado, os limites documentados e cada integração marcada com evidência real. Se faltar acesso/credenciais/ação humana, registar exatamente o bloqueio e continuar todo o trabalho independente; nunca inventar sucesso nem ficar parado à espera.

### Contexto operacional
Empresa em Portugal: RWJM / JM Beloura. Oficina com mecânica, eletrónica, diagnóstico, pneus, montagem, reparação de jantes, alinhamento e intenção de comercializar usados. Software atual: OfficeGest (faturação/gestão) e GT Estimate (orçamentação). Fornecedores habituais: Autozitania, Create/Drive360, AleCarPecas, Auto Delta via AleCarPecas e MCoutinho. Necessidades: fluxo rápido de receção, identificação exata por matrícula/VIN, versão/motor/código motor, dados técnicos, manutenção por quilometragem, DTC, TecDoc/OE, equivalências, disponibilidade, stock e preços, margens, encomenda, histórico, fotos de entrada e integração com OfficeGest. Orçamento de software limitado; preferir gratuito ou custo baixo, mas não sacrificar compatibilidade nem precisão. Portugal é o mercado-base; incluir UE e mercado global quando a compra e entrega em Portugal forem viáveis.

### Fase 0 — Recuperação e auditoria
1. Descobrir o repositório, branches, commits, PRs, workflows, serviços Render, deployments, logs, rotas, configuração, variáveis existentes (apenas presença/ausência; nunca revelar valores), documentação e testes.
2. Ler todo o código e histórico relevante antes de editar. Reutilizar serviços e componentes que funcionem; evitar reescrita total.
3. Fazer inventário de cada endpoint e classificar: código existe, testes offline, publicado, autenticação testada, fornecedor real testado, cobertura/precisão conhecida.
4. Fazer cópias de segurança lógicas via commits, implementar mudanças pequenas, correr testes, verificar resultados e atualizar documentação/catálogo.
5. Nunca assumir que “health ok” prova que as integrações externas funcionam.

### Fase 1 — Identificação de viaturas
Investigar e comparar, sem limitar a lista inicial:
- Matrícula portuguesa → marca/modelo/ano/versão/motor/código motor/VIN, incluindo matrículas antigas, importados, motociclos e comerciais.
- VIN → dados técnicos e identificação exata de variante.
- Registos/histórico, quilometragem, acidentes, importação, sinistros, recalls, furto/ônus/penhoras quando legalmente acessível.
- Bases públicas, fornecedores comerciais, distribuidores, APIs, catálogos, bases OEM, dados de homologação e alternativas manuais.
- Candidatos a pesquisar: RegCheck/Matricula.co.pt, Auto.dev, CarsXE, CarAPI.app, CarsXE, VehicleDB, VINWhere, DB.VIN, VINAPI, PlateToVIN, LicensePlateData, OneAutoAPI, RevCarData, CarVertical, autoDNA, CARFAX Europe, NHTSA/vPIC, e todos os novos fornecedores encontrados.
Para cada um: país suportado explicitamente, campos devolvidos, VIN garantido ou opcional, taxa de acerto, preço, créditos mínimos, trial, limites, latência, termos, privacidade, endpoint/documentação oficial e resultado de teste. Não inferir suporte de Portugal a partir de “global”.

### Fase 2 — Catálogo técnico e manutenção
Pesquisar:
- TecAlliance/TecDoc/TecCom, FAPI Catalog, OE e referências cruzadas, catálogos de fabricantes e distribuidores.
- Autodata, HaynesPro/WorkshopData, dados de revisões, binários de óleo, intervalos, tempos de mão de obra, diagramas elétricos, procedimentos, apertos, codificações e DTC.
- Fabricantes: Bosch, ZF, Schaeffler (LuK/INA/FAG), Valeo, MAHLE, HELLA, Continental, Gates, SKF, NGK/NTK, Denso, Febi, Meyle, Delphi, TRW, Monroe, Bilstein, Brembo, ATE, Textar, Mann-Filter, Mahle, Purflux, Hengst, Dayco, SKF, Pierburg e outros relevantes.
- Compatibilidade de pneus/jantes, dimensões OEM, ET, PCD, cubo, índices, homologação e equivalências; VDIM e outras fontes; car-audio/retrofit via YMMFit, Connects2, Metra, ACV e similares.
Separar catálogo de peças, dados de reparação e compatibilidade física: não são substitutos entre si. Exigir evidência por VIN/versão/opções sempre que possível.

### Fase 3 — Fornecedores e comparação global de peças
Investigar fornecedores nacionais, ibéricos, europeus e globais, incluindo os já usados pela empresa, distribuidores oficiais, grossistas B2B, marketplaces e desmantelamentos legais.
Pesquisar por referência OEM, referência aftermarket, EAN/GTIN, marca, descrição, veículo, código motor e equivalentes. Incluir peças novas, usadas, recondicionadas e alternativas, mantendo condição separada.
Para cada oferta guardar:
- URL direta, vendedor, país, referência exata, marca, condição, compatibilidade e evidência.
- preço líquido/bruto, moeda, IVA, portes para o código postal de entrega em Portugal, custos de manuseamento, taxas, alfândega quando aplicável, entrega prevista, stock e timestamp.
- cupões, restrições, validade, mínimo de compra, exclusões, custo após cupão e prova do teste no checkout quando permitido.
- devoluções, garantia, reputação, política B2B, faturação válida e risco de contrafação.
Comparar por custo final entregue, não pelo preço de anúncio. Normalizar moedas usando taxa atual com timestamp. Não assumir que IVA está incluído nem aplicar alfândega sem determinar origem e regime. Se portes ou impostos não forem conhecidos, o total é “incompleto”, nunca “o mais barato”. Não contornar paywalls, autenticação, robots, quotas ou termos.

### Fase 4 — Cupões e promoções
Investigar APIs oficiais de afiliados, feeds de fornecedores, newsletters autorizadas, campanhas, códigos públicos e portais de cupões. Candidatos incluem Awin e programas oficiais dos comerciantes. Verificar:
- código real, loja, país, categoria, elegibilidade B2B, validade, mínimo, exclusões e cumulatividade;
- aplicação do desconto no checkout ou evidência do comerciante;
- se o preço base mudou, portes, IVA, devoluções e comissões de afiliado.
Distinguir “encontrado”, “aparentemente válido”, “aceite no checkout” e “compra concluída”. Nunca dizer “testado” sem teste real.

### Fase 5 — Oficina, ERP e automação
Investigar e integrar quando autorizado:
- OfficeGest API v1/v2, WebServices, webhooks, clientes, viaturas, documentos, stock, compras, fornecedores, contabilidade e ordens de reparação.
- GT Estimate e quaisquer interfaces licenciadas.
- TelePeças, Autozitania, Create/Drive360, AleCarPecas/Auto Delta, MCoutinho e outros fornecedores, distinguindo API oficial, portal web, ficheiros, feeds, EDI e automação permitida.
- Receção ativa: matrícula → viatura/VIN → versão/motor → dados técnicos → plano de manutenção → peças → compatibilidade → stock → preço/margem → orçamento → ordem de reparação → OfficeGest.
- Fotos de entrada/saída, danos preexistentes, consentimento e trilho de auditoria.
- Pneus/alinhamento, identificação de medidas, equipamentos e documentação.
Não inventar endpoints de fornecedores. Obter OpenAPI/Swagger, contrato ou documentação da conta; usar sandbox primeiro.

### Fase 6 — APIs e arquitetura
Avaliar REST/GraphQL, CSV/XML/EDI, webhooks, MCP, scraping autorizado, bases abertas e pesquisa web. Candidatos a investigar incluem:
- RegCheck, Matricula.co.pt, Auto.dev, CarsXE, CarAPI.app, VehicleDB, VINWhere, DB.VIN, VINAPI, PlateToVIN, LicensePlateData, OneAutoAPI, RevCarData, CarVertical, autoDNA, CARFAX Europe, NHTSA/vPIC.
- TecAlliance/TecDoc/TecCom, FAPI, AutoPartsAPI/APIProfile, Parts Resolve, CarScan, AutoWiz, Autodata, HaynesPro/WorkshopData.
- Bosch, ZF, Schaeffler, Valeo, MAHLE, HELLA, Continental, Gates, SKF, Denso, Delphi, Brembo e restantes fabricantes.
- VDIM, YMMFit, Michelin e fornecedores de pneus/fitment.
- OfficeGest, TelePeças, eBay Browse, Google Shopping/SerpApi, feeds de fornecedores, APIs de cupões/afiliados, CarVertical e serviços de histórico.
- APIs de IA (OpenAI, Gemini, xAI) apenas para extração/classificação auxiliar; a lógica de preço, compatibilidade e IVA deve continuar determinística e auditável.
Pesquisar também novas APIs não listadas. Verificar estado do produto, documentação oficial, preços atuais, trial, limites, região, termos, suporte, segurança e alternativas gratuitas.

### Fase 7 — Credenciais, custos e permissões
Produzir uma matriz única de credenciais que inclua todas as variáveis realmente usadas pelo código e todas as credenciais opcionais dos candidatos escolhidos. Para cada uma, documentar:
- nome exato da variável, serviço, fornecedor, URL oficial para criar a conta/obter a chave, plano/entitlement necessário, custos e limites conhecidos;
- se é necessária agora, opcional, duplicada ou não implementada;
- onde configurar (Render Environment), como testar sem mostrar o segredo e como revogar/rodar.
Nunca imprimir, recuperar para a conversa, copiar para logs ou guardar segredos no GitHub/catálogo. Não criar variáveis sem código consumidor ou contrato confirmado. Não ativar planos pagos, compras de créditos ou assinaturas sem autorização explícita; dar prioridade a opções gratuitas que realmente cubram Portugal.

### Fase 8 — Testes e qualidade
Criar testes automatizados para:
- matrículas portuguesas, normalização, VIN ausente e erro do fornecedor;
- VIN inválido, veículo ambíguo, versão/motor divergentes e fallback entre fontes;
- equivalências de referências e compatibilidade;
- moedas, IVA, portes, alfândega, descontos, limites, arredondamento e ofertas incompletas;
- cupões expirados, restrições e resultados sem prova;
- timeouts, 401/403/404/429/5xx, resposta malformada, credenciais em falta, cache e rate limits;
- autenticação das rotas e ausência de fuga de segredos;
- integração OfficeGest em sandbox, idempotência e prevenção de documentos/encomendas duplicados.
Depois dos testes offline, executar chamadas reais de leitura quando credenciais e autorização existirem. Nunca enviar encomendas, criar documentos contabilísticos ou fazer compras reais sem autorização específica. Guardar evidência redigida de tokens.

### Fase 9 — Catálogo central e memória de pesquisa
Usar um único catálogo central pesquisável, com tags, sem criar silos por tema. Cada registo deve ter:
id, nome, URL oficial, categoria, tags, região, estado, data da última verificação, tipo de acesso, preço/limites, credencial necessária (apenas nome da variável), cobertura, evidência, limitações, próxima ação e resultado do teste.
Criar logs de investigação datados e atualizar o índice de conhecimento do JM Vault. Marcar claramente:
- documentado em fonte oficial;
- testado offline;
- autenticação validada;
- chamada real validada;
- produção publicada;
- limitações conhecidas.
Não promover candidato a “funcional” sem evidência correspondente.

### Fase 10 — Critério de conclusão
Só terminar quando:
1. Todas as categorias anteriores e novas hipóteses relevantes tiverem sido pesquisadas, com queries e fontes registadas.
2. Cada candidato tiver sido integrado, rejeitado com razão ou bloqueado por falta de acesso/contrato.
3. As alternativas gratuitas e os custos de cada opção paga estiverem comparados.
4. O código estiver integrado no branch correto, os testes passarem e o deploy publicado tiver sido verificado.
5. A matriz de credenciais estiver completa, com links diretos e estado de configuração sem valores secretos.
6. Existir uma tabela final de capacidades com estados reais e uma lista exata dos únicos passos que dependem de credenciais ou clique humano.
7. Não restar nenhuma linha de investigação óbvia por explorar. Se uma API não tiver documentação pública ou o nome for ambíguo, isso deve ficar explícito em vez de inventar.
