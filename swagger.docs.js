/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Endpoints para verificação de saúde da API
 *   - name: Auth
 *     description: Autenticação e autorização de usuários
 *   - name: Crops
 *     description: Gerenciamento de cultivos
 *   - name: Protocols
 *     description: Protocolos de manejo
 *   - name: Recommendations
 *     description: Sistema de recomendações
 *   - name: Productivity
 *     description: Cálculos de produtividade
 *   - name: Monitoring
 *     description: Monitoramento de campos e sensores
 *   - name: Professional
 *     description: Recursos premium para agrônomos
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verificação de saúde da API
 *     description: Retorna o status de saúde da aplicação e informações do sistema
 *     responses:
 *       200:
 *         description: API funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *       503:
 *         description: API com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registro de novo usuário
 *     description: Cria uma nova conta de usuário (agricultor ou agrônomo)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "joao_fazendeiro"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@fazenda.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "senha123"
 *               confirmPassword:
 *                 type: string
 *                 example: "senha123"
 *               firstName:
 *                 type: string
 *                 example: "João"
 *               lastName:
 *                 type: string
 *                 example: "Silva"
 *               role:
 *                 type: string
 *                 enum: [farmer, agronomist]
 *                 example: "farmer"
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@fazenda.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Informações do usuário logado
 *     description: Retorna as informações do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/crops:
 *   get:
 *     tags: [Crops]
 *     summary: Lista todos os cultivos
 *     description: Retorna lista completa de cultivos disponíveis no sistema
 *     responses:
 *       200:
 *         description: Lista de cultivos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Crop'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/protocols:
 *   get:
 *     tags: [Protocols]
 *     summary: Lista todos os protocolos de manejo
 *     description: Retorna lista completa de protocolos de manejo disponíveis
 *     responses:
 *       200:
 *         description: Lista de protocolos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Protocol'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     tags: [Recommendations]
 *     summary: Lista recomendações do usuário
 *     description: Retorna todas as recomendações do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recomendações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recommendation'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     tags: [Recommendations]
 *     summary: Criar nova recomendação
 *     description: Cria uma nova recomendação para o usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cropId
 *               - protocolId
 *               - title
 *               - description
 *               - category
 *             properties:
 *               cropId:
 *                 type: string
 *                 format: uuid
 *               protocolId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [soil_management, crop_management, pest_management]
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, scheduled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Recomendação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/recommendations/generate:
 *   post:
 *     tags: [Recommendations]
 *     summary: Gerar recomendações automáticas
 *     description: Gera recomendações automáticas baseadas no cultivo e protocolo selecionados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cropId
 *               - protocolId
 *             properties:
 *               cropId:
 *                 type: string
 *                 format: uuid
 *               protocolId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Recomendações geradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/productivity/calculate:
 *   post:
 *     tags: [Productivity]
 *     summary: Calcular produtividade
 *     description: Calcula a produtividade estimada usando dados do IBGE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - municipality
 *               - state
 *               - area
 *               - cropId
 *             properties:
 *               municipality:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               area:
 *                 type: number
 *                 example: 10.5
 *               cropId:
 *                 type: string
 *                 format: uuid
 *               year:
 *                 type: integer
 *                 example: 2023
 *     responses:
 *       200:
 *         description: Cálculo realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 calculation:
 *                   $ref: '#/components/schemas/ProductivityCalculation'
 *                 data:
 *                   type: object
 *                   properties:
 *                     yield:
 *                       type: number
 *                     totalProduction:
 *                       type: number
 *                     marketValue:
 *                       type: number
 *                     source:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/productivity/calculations:
 *   get:
 *     tags: [Productivity]
 *     summary: Histórico de cálculos
 *     description: Retorna o histórico de cálculos de produtividade do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cálculos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductivityCalculation'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
