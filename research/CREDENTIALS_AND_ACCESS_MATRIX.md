# JM Beloura — matriz completa de credenciais e acessos
Atualizada: 2026-10-18

**Regra:** nomes de variáveis não são segredos. Os valores ficam apenas no Render → Environment ou no gestor de segredos do fornecedor. Nunca colocar tokens nesta matriz, no GitHub, em logs ou no chat. Não criar contas pagas nem comprar créditos sem autorização.

## A. Variáveis já referenciadas pelo código em main

| Variável exata | Serviço/função | Prioridade | Obter/configurar | Estado a confirmar |
|---|---|---|---|---|
| `VAULT_TOKEN` | Protege as rotas privadas do JM API Vault | **Obrigatória** | Gerar/guardar um token forte; Render Environment | Não substituir se já funciona. Confirmar presença sem mostrar valor. |
| `AUTO_DEV_API_KEY` | Descodificação VIN Auto.dev | Alta para VIN | https://www.auto.dev/ | Confirmar conta, quota e cobertura; não confundir VIN decode com matrícula PT. |
| `REGCHECK_USERNAME` | Identificação por matrícula portuguesa | Alta | https://www.matricula.co.pt/data/api-docs.aspx/portugal | A API exige credenciais de conta. |
| `REGCHECK_API_KEY` | Identificação por matrícula portuguesa | Alta | Mesmo portal RegCheck | 10 consultas de teste previamente documentadas; depois €0,20 por sucesso, mínimo 100 créditos. VIN não garantido. |
| `TELEPECAS_API_TOKEN` | Pesquisa de stock/referências TelePeças | Alta | https://api.telepecas.com/docs/ | OAuth2 e permissões da conta; confirmar o contrato real do endpoint antes de usar dados de produção. |
| `SERPAPI_API_KEY` | Descoberta de ofertas via Google Shopping | Alta para pesquisa global | https://serpapi.com/google-shopping-api | Confirmar quota gratuita atual e custos de excesso; resultados não provam custo entregue. |
| `AWIN_PUBLISHER_ID` | Feeds/API de campanhas Awin | Complementar | https://www.awin.com/ | Só se a conta for aprovada e os comerciantes forem relevantes. |
| `AWIN_API_TOKEN` | API Awin | Complementar | https://developer.awin.com/ | Confirmar permissões; cupões só são “testados” após validação aplicável no checkout. |

O servidor também usa `PORT`, normalmente fornecida automaticamente pelo Render; não a definir manualmente salvo necessidade documentada.

## B. Credenciais candidatas — só adicionar depois de decidir e implementar o adaptador

| Variável proposta | Fornecedor | Utilidade | Custo/acesso e validação |
|---|---|---|---|
| `CARSXE_API_KEY` | CarsXE — https://docs.carsxe.com/docs/get-started | Matrícula, VIN, especificações, histórico, recalls e valorização | Comercial; testar matrícula PT, VIN e preço por consulta antes de comprar. |
| `CARAPI_SECRET` | CarAPI.app — https://carapi.app/pricing/license-plate/ | Matrícula → VIN em países suportados | Pacotes publicados desde $4/10 consultas; confirmar explicitamente Portugal. |
| `TECALLIANCE_API_KEY` / credenciais fornecidas pelo contrato | TecAlliance/TecDoc — https://www.tecalliance.net/tecdoc/ | Catálogo, veículos, OE, equivalências e compatibilidade | Comercial/licença; usar os nomes reais prescritos no contrato, não assumir estes nomes. |
| `TECCOM_*` | TecCom — https://www.tecalliance.net/teccom/ | Disponibilidade, encomendas e estado | Contrato e fornecedores participantes; definir nomes só após receber especificação oficial. |
| `FAPI_API_KEY` | FAPI Catalog — https://github.com/fapi-dev/catalog-openapi | Catálogo e referências cruzadas | API com créditos; validar cobertura, trial e licença. Nome da variável a confirmar na documentação da conta. |
| `OFFICEGEST_API_BASE_URL` | OfficeGest — https://api.officegest.com/docs | Base URL específica da instalação | A API v2 é experimental; a v1 usa Basic Auth. Não guardar passwords na URL. |
| `OFFICEGEST_API_TOKEN` | OfficeGest v2 | Clientes, documentos, stock e integrações | Gerar pela autenticação documentada; confirmar se o módulo/API está ativo. |
| `OFFICEGEST_API_USERNAME` / `OFFICEGEST_API_PASSWORD` | OfficeGest v1 | Autenticação Basic | Apenas se a instalação usa v1; preferir token v2 se suportado e apropriado. |
| `AUTODATA_API_KEY` | Autodata — https://developer.autodata-group.com/io-docs | Dados técnicos, manutenção, reparação e diagramas | Acesso API por contacto de integração; subscrição normal não garante API. |
| `HAYNESPRO_*` | HaynesPro — https://www.haynespro.com/ | Procedimentos, manutenção e dados técnicos | Pedir API/licença e nomes exatos ao fornecedor. |
| `VDIM_API_KEY` | VDIM — https://tire.vdim.app/api/docs | Dimensões de pneus e fitment | Free: 250 consultas de fitment/mês mais bónus único de 250; quotas separadas para VIN/reverse lookup. Respeitar termos. |
| `YMMFIT_API_KEY` | YMMFit — https://ymmfit.com/fitment-api | Rádios, molduras, cablagens, câmaras e CarPlay | Sandbox limitado; catálogo completo anunciado desde €149. Confirmar acesso/contrato. |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | eBay Browse API — https://developer.ebay.com/api-docs/buy/browse/overview.html | Pesquisa de anúncios e compatibilidade | App de developer e token; confirmar produção, marketplace e portes para PT. |
| `CARVERTICAL_API_KEY` ou credencial contratual | carVertical Business — https://www.carvertical.com/en/business/api | Histórico e identificação para usados | Solução B2B por proposta; não assumir que a compra de relatórios dá acesso API. |
| `AUTODNA_API_KEY` ou credencial contratual | autoDNA — https://www.autodna.com/ | Histórico de importados/usados | Confirmar API B2B e custo. |
| `CARFAX_API_KEY` ou credencial contratual | CARFAX Europe — https://www.carfax.eu/ | Histórico de usados | Confirmar integração B2B e custo. |
| `MICHELIN_API_KEY` ou credencial contratual | Michelin — https://developer.michelin.com/ | Dados de pneus/mobilidade | Produto/API e elegibilidade a confirmar. |
| `OPENAI_API_KEY` | OpenAI Platform — https://platform.openai.com/docs/ | Extração/classificação auxiliar | API faturada separadamente; não incluída na subscrição ChatGPT. Opcional. |
| `GEMINI_API_KEY` | Gemini API — https://ai.google.dev/gemini-api/docs | Extração/classificação auxiliar | Pode haver quota gratuita limitada; verificar termos e limites atuais. Opcional. |
| `XAI_API_KEY` | xAI — https://docs.x.ai/ | Modelo alternativo para classificação | Uso potencialmente faturado; opcional. |
| Credencial definida pelo contrato | Bosch/ZF/Schaeffler/Valeo/MAHLE/HELLA e restantes fabricantes | Catálogos, procedimentos, dados técnicos | Não foi confirmada uma API pública geral para todos. Contactar o programa oficial de dados de cada fabricante. |

## C. Não são credenciais API confirmadas
IMT, AT/Finanças, ASF, IRN e IPMA são fontes oficiais relevantes para compliance, informação pública ou operações. Não criar variáveis API para estes organismos sem descobrir um endpoint oficial documentado e autorizado. Não confundir um portal web com API pública.

## D. Como preencher e testar sem revelar segredos
1. Abrir https://dashboard.render.com/web/srv-dau4vamk1f9s73acgna0 → **Environment**.
2. Configurar apenas as variáveis do código atual e das integrações efetivamente escolhidas.
3. Guardar; o Render poderá reiniciar/republicar o serviço.
4. Verificar o estado por endpoint de diagnóstico que devolva apenas `configured: true/false`, nunca valor, prefixo, comprimento ou hash do segredo.
5. Fazer chamada real de leitura com uma consulta conhecida, verificar status, esquema de resposta, quotas e custo; redigir tokens dos logs.
6. Não enviar encomendas, criar faturas/documentos, comprar créditos ou efetuar pagamentos reais sem autorização expressa.
7. Depois do teste, registar data, fonte, endpoint, código HTTP, campos recebidos, custo, latência e resultado sem dados pessoais nem segredos.

## E. Prioridade recomendada
**Primeiro:** manter `VAULT_TOKEN`; testar `REGCHECK_USERNAME` + `REGCHECK_API_KEY`; validar `TELEPECAS_API_TOKEN`; confirmar `SERPAPI_API_KEY`; confirmar `AUTO_DEV_API_KEY`.

**Segundo:** OfficeGest API (para integrar receção, orçamento, stock e documentos), TecDoc/TecAlliance (para compatibilidade fiável) e Autodata/HaynesPro (para procedimentos e manutenção), depois de obter preços/licenças.

**Terceiro:** VDIM e YMMFit para pneus/retrofit; eBay e histórico B2B para casos em que acrescentem cobertura real.

Não ativar todas as APIs por princípio: ativar apenas após comparação de custo, cobertura portuguesa, qualidade, direitos de uso e alternativa gratuita.
