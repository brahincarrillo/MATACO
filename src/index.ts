#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const MATACO_URL =
  "https://script.google.com/macros/s/AKfycbx6w2Nj_27qRjm-JYMR40aCn18QXZ3jx-14pkG9fZgi2CcmHA2Vh9_3GPq4AaOVz6wC/exec";

const MESES = [
  "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
  "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE",
] as const;

const TIPOS = ["gasto", "ingreso", "tarjeta"] as const;

const TARJETAS = ["Visa NARANJA", "Naranja X", "Débito"] as const;

const TIPOS_PAGO = [
  "Pago único",
  "Compra en cuotas",
  "Suscripción mensual",
  "Débito Aut.",
] as const;

async function callMataco(body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(MATACO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

const server = new Server(
  { name: "mataco", version: "3.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "registrarGasto",
      description: "Registra un gasto en las finanzas personales",
      inputSchema: {
        type: "object",
        required: ["importe", "descripcion", "categoria"],
        properties: {
          importe: { type: "number", description: "Monto del gasto en pesos" },
          descripcion: { type: "string", description: "Descripción del gasto" },
          categoria: { type: "string", description: "Categoría (ej: Super, Transporte, etc.)" },
          fecha: { type: "string", description: "Fecha en formato DD/MM/YYYY (opcional, default hoy)" },
          mes: { type: "string", enum: MESES, description: "Mes de registro" },
        },
      },
    },
    {
      name: "registrarIngreso",
      description: "Registra un ingreso en las finanzas personales",
      inputSchema: {
        type: "object",
        required: ["importe", "descripcion", "categoria"],
        properties: {
          importe: { type: "number", description: "Monto del ingreso en pesos" },
          descripcion: { type: "string", description: "Descripción del ingreso" },
          categoria: { type: "string", description: "Categoría del ingreso" },
          fecha: { type: "string", description: "Fecha en formato DD/MM/YYYY" },
          mes: { type: "string", enum: MESES },
        },
      },
    },
    {
      name: "registrarTarjeta",
      description: "Registra un gasto con tarjeta de crédito o débito",
      inputSchema: {
        type: "object",
        required: ["importe", "descripcion", "tarjeta", "tipo_pago"],
        properties: {
          importe: { type: "number", description: "Monto en pesos" },
          descripcion: { type: "string", description: "Descripción del gasto" },
          categoria: { type: "string" },
          fecha: { type: "string", description: "Fecha en formato DD/MM/YYYY" },
          mes: { type: "string", enum: MESES },
          tarjeta: { type: "string", enum: TARJETAS, description: "Tarjeta utilizada" },
          tipo_pago: { type: "string", enum: TIPOS_PAGO, description: "Tipo de pago" },
          importe_usd: { type: "number", description: "Monto en dólares (si aplica)" },
          cuota: { type: "string", description: "Cuota actual/total (ej: '02/06')" },
        },
      },
    },
    {
      name: "listarMovimientos",
      description: "Lista los movimientos financieros de un mes",
      inputSchema: {
        type: "object",
        properties: {
          mes: { type: "string", enum: MESES, description: "Mes a listar (default: mes actual)" },
          tipo: { type: "string", enum: TIPOS, description: "Filtrar por tipo" },
          limite: { type: "integer", description: "Cantidad máxima de resultados", default: 10 },
        },
      },
    },
    {
      name: "buscarMovimientos",
      description: "Busca movimientos por término en descripción o categoría",
      inputSchema: {
        type: "object",
        required: ["termino"],
        properties: {
          termino: { type: "string", description: "Término de búsqueda" },
          mes: { type: "string", enum: MESES },
          limite: { type: "integer", default: 10 },
        },
      },
    },
    {
      name: "eliminarMovimiento",
      description: "Elimina un movimiento por número de fila",
      inputSchema: {
        type: "object",
        required: ["fila", "mes"],
        properties: {
          fila: { type: "integer", description: "Número de fila del movimiento" },
          mes: { type: "string", enum: MESES },
        },
      },
    },
    {
      name: "editarMovimiento",
      description: "Edita un movimiento existente por número de fila",
      inputSchema: {
        type: "object",
        required: ["fila", "mes"],
        properties: {
          fila: { type: "integer", description: "Número de fila del movimiento" },
          mes: { type: "string", enum: MESES },
          importe: { type: "number" },
          descripcion: { type: "string" },
          categoria: { type: "string" },
          fecha: { type: "string" },
        },
      },
    },
    {
      name: "generarResumen",
      description: "Genera un resumen financiero del mes con totales por categoría",
      inputSchema: {
        type: "object",
        properties: {
          mes: { type: "string", enum: MESES, description: "Mes a resumir (default: mes actual)" },
        },
      },
    },
    {
      name: "resumenSemanal",
      description: "Genera un resumen de la semana actual",
      inputSchema: {
        type: "object",
        properties: {
          mes: { type: "string", enum: MESES },
        },
      },
    },
    {
      name: "calcularScore",
      description: "Calcula el score financiero personal del mes",
      inputSchema: {
        type: "object",
        properties: {
          mes: { type: "string", enum: MESES },
        },
      },
    },
    {
      name: "compararMeses",
      description: "Compara dos meses entre sí con análisis de diferencias",
      inputSchema: {
        type: "object",
        required: ["mes1", "mes2"],
        properties: {
          mes1: { type: "string", enum: MESES, description: "Primer mes a comparar" },
          mes2: { type: "string", enum: MESES, description: "Segundo mes a comparar" },
        },
      },
    },
    {
      name: "crearPestana",
      description: "Crea una nueva pestaña en la hoja de cálculo",
      inputSchema: {
        type: "object",
        required: ["nombre", "tipo_pestana"],
        properties: {
          nombre: { type: "string", description: "Nombre de la pestaña" },
          tipo_pestana: {
            type: "string",
            enum: ["transacciones", "tarjetas", "resumen"],
            description: "Tipo de pestaña a crear",
          },
        },
      },
    },
    {
      name: "listarPestanas",
      description: "Lista todas las pestañas disponibles en la hoja de cálculo",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "crearDocumento",
      description: "Crea un nuevo documento en Google Drive",
      inputSchema: {
        type: "object",
        required: ["nombre", "tipo_documento"],
        properties: {
          nombre: { type: "string", description: "Nombre del documento" },
          tipo_documento: {
            type: "string",
            enum: ["spreadsheet", "document", "carpeta"],
            description: "Tipo de documento a crear",
          },
          contenido: { type: "string", description: "Contenido inicial del documento" },
        },
      },
    },
    {
      name: "listarDocumentos",
      description: "Lista los documentos de Google Drive asociados a MATACO",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "obtenerCategorias",
      description: "Obtiene la lista de categorías disponibles para gastos e ingresos",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  const validActions = [
    "registrarGasto", "registrarIngreso", "registrarTarjeta",
    "listarMovimientos", "buscarMovimientos", "eliminarMovimiento",
    "editarMovimiento", "generarResumen", "resumenSemanal",
    "calcularScore", "compararMeses", "crearPestana", "listarPestanas",
    "crearDocumento", "listarDocumentos", "obtenerCategorias",
  ];

  if (!validActions.includes(name)) {
    return {
      content: [{ type: "text", text: `Operación desconocida: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await callMataco({ action: name, ...args });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MATACO MCP server iniciado");
}

main().catch(console.error);
