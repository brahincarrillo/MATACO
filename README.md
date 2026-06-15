# MATACO MCP Server

MCP (Model Context Protocol) server para interactuar con la API financiera personal MATACO 3.0.

## Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| `registrarGasto` | Registra un gasto |
| `registrarIngreso` | Registra un ingreso |
| `registrarTarjeta` | Registra gasto con tarjeta |
| `listarMovimientos` | Lista movimientos del mes |
| `buscarMovimientos` | Busca por término |
| `eliminarMovimiento` | Elimina un movimiento por fila |
| `editarMovimiento` | Edita un movimiento existente |
| `generarResumen` | Resumen financiero del mes |
| `resumenSemanal` | Resumen de la semana |
| `calcularScore` | Score financiero personal |
| `compararMeses` | Compara dos meses |
| `crearPestana` | Crea pestaña en la hoja |
| `listarPestanas` | Lista pestañas disponibles |
| `crearDocumento` | Crea documento en Drive |
| `listarDocumentos` | Lista documentos de Drive |
| `obtenerCategorias` | Lista categorías disponibles |

## Instalación

```bash
npm install
npm run build
```

## Configuración en Claude Desktop

Agregar en `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mataco": {
      "command": "node",
      "args": ["/ruta/al/repo/dist/index.js"]
    }
  }
}
```

## Configuración en Claude Code (claude.ai/code)

Agregar en `.claude/settings.json` del proyecto o en `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "mataco": {
      "command": "node",
      "args": ["/ruta/al/repo/dist/index.js"],
      "type": "stdio"
    }
  }
}
```

## Desarrollo

```bash
npm run dev   # Ejecutar con tsx sin compilar
npm run build # Compilar TypeScript
npm start     # Ejecutar versión compilada
```
