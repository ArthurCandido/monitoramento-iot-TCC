'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Code, Database, Wifi, Zap, FileText } from 'lucide-react'

interface ApiEndpoint {
  path: string
  method: string
  summary: string
  description: string
  tags: string[]
}

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        const response = await fetch('/api/docs')
        const spec = await response.json()
        setSwaggerSpec(spec)
      } catch (error) {
        console.error('Erro ao carregar especificação da API:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSwaggerSpec()
  }, [])

  const openSwaggerUI = () => {
    // Abrir Swagger UI em nova aba
    window.open('https://petstore.swagger.io/?url=' + encodeURIComponent(window.location.origin + '/api/docs'), '_blank')
  }

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-green-500/10 text-green-600 border-green-500/30'
      case 'post': return 'bg-blue-500/10 text-blue-600 border-blue-500/30'
      case 'put': return 'bg-orange-500/10 text-orange-600 border-orange-500/30'
      case 'delete': return 'bg-red-500/10 text-red-600 border-red-500/30'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/30'
    }
  }

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'ESP32 Data': return <Wifi className="h-4 w-4" />
      case 'Alerts': return <Zap className="h-4 w-4" />
      case 'System': return <Code className="h-4 w-4" />
      case 'Database': return <Database className="h-4 w-4" />
      case 'Documentation': return <FileText className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!swaggerSpec) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar documentação</h1>
        <p className="text-muted-foreground">Não foi possível carregar a especificação da API.</p>
      </div>
    )
  }

  const endpoints: ApiEndpoint[] = []
  if (swaggerSpec.paths) {
    Object.entries(swaggerSpec.paths).forEach(([path, pathItem]: [string, any]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: operation.summary || '',
          description: operation.description || '',
          tags: operation.tags || []
        })
      })
    })
  }

  // Agrupar endpoints por tag
  const endpointsByTag = endpoints.reduce((acc, endpoint) => {
    const tag = endpoint.tags[0] || 'Other'
    if (!acc[tag]) acc[tag] = []
    acc[tag].push(endpoint)
    return acc
  }, {} as Record<string, ApiEndpoint[]>)

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {swaggerSpec.info?.title || 'API Documentation'}
              </h1>
              <p className="text-muted-foreground">
                {swaggerSpec.info?.version && `Versão ${swaggerSpec.info.version} - `}
                Documentação completa da API do sistema IoT
              </p>
            </div>
            <Button onClick={openSwaggerUI} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir Swagger UI
            </Button>
          </div>

          {/* Descrição */}
          {swaggerSpec.info?.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sobre o Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {swaggerSpec.info.description}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Servidores */}
        {swaggerSpec.servers && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Servidores</CardTitle>
              <CardDescription>Endpoints disponíveis da API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {swaggerSpec.servers.map((server: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{server.description}</p>
                      <p className="text-sm text-muted-foreground font-mono">{server.url}</p>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {index === 0 ? "Produção" : "Desenvolvimento"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endpoints por categoria */}
        <div className="space-y-8">
          {Object.entries(endpointsByTag).map(([tag, tagEndpoints]) => (
            <div key={tag}>
              <div className="flex items-center gap-3 mb-4">
                {getTagIcon(tag)}
                <h2 className="text-2xl font-bold">{tag}</h2>
                <Badge variant="outline">{tagEndpoints.length} endpoints</Badge>
              </div>

              <div className="space-y-4">
                {tagEndpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getMethodColor(endpoint.method)} border font-mono`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <CardTitle className="text-lg">{endpoint.summary}</CardTitle>
                    </CardHeader>
                    {endpoint.description && (
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {endpoint.description}
                          </pre>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Especificação:</p>
                <p className="text-muted-foreground">OpenAPI {swaggerSpec.openapi}</p>
              </div>
              <div>
                <p className="font-medium mb-1">Formato de resposta:</p>
                <p className="text-muted-foreground">JSON</p>
              </div>
              {swaggerSpec.info?.contact && (
                <div>
                  <p className="font-medium mb-1">Contato:</p>
                  <a 
                    href={swaggerSpec.info.contact.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {swaggerSpec.info.contact.name}
                  </a>
                </div>
              )}
              {swaggerSpec.info?.license && (
                <div>
                  <p className="font-medium mb-1">Licença:</p>
                  <a 
                    href={swaggerSpec.info.license.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {swaggerSpec.info.license.name}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}