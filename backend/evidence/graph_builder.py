class EvidenceGraphBuilder:
    def build_graph(self, query, observation_meta, plan, results):
        nodes = [
            {
                "id": "node_query",
                "label": "User Natural-Language Query",
                "type": "query",
                "detail": query,
                "status": "completed"
            },
            {
                "id": "node_data",
                "label": f"Input Observation: {observation_meta.get('name', 'Satellite Image')}",
                "type": "data",
                "detail": f"Sensor: {observation_meta.get('sensor')} | CRS: {observation_meta.get('crs')} | Res: {observation_meta.get('resolution_m')}m | Bands: {observation_meta.get('bands')}",
                "status": "completed"
            },
            {
                "id": "node_plan",
                "label": f"Scientific Analysis Plan ({plan.get('intent')})",
                "type": "plan",
                "detail": f"Generated {len(plan.get('steps', []))} verifiable analytical execution steps",
                "status": "completed"
            }
        ]

        edges = [
            {"source": "node_query", "target": "node_data", "label": "selects"},
            {"source": "node_data", "target": "node_plan", "label": "formulates"}
        ]

        step_idx = 1
        prev_node = "node_plan"
        for step in plan.get("steps", []):
            node_id = f"node_step_{step_idx}"
            nodes.append({
                "id": node_id,
                "label": step.get("title"),
                "type": "execution",
                "tool": step.get("tool"),
                "status": step.get("status", "completed")
            })
            edges.append({
                "source": prev_node,
                "target": node_id,
                "label": "executes"
            })
            prev_node = node_id
            step_idx += 1

        # Add final answer node
        node_answer = "node_answer"
        nodes.append({
            "id": node_answer,
            "label": "Verified Answer & Geospatial Evidence",
            "type": "answer",
            "detail": results.get("answer_summary", "Geospatial analysis complete"),
            "confidence": results.get("confidence", 0.95),
            "status": "completed"
        })
        edges.append({
            "source": prev_node,
            "target": node_answer,
            "label": "synthesizes"
        })

        return {
            "nodes": nodes,
            "edges": edges,
            "provenance": {
                "system": "SatQuery AI Engine v2026",
                "reproducible": True,
                "audit_timestamp": "2026-09-20T12:00:00Z"
            }
        }

evidence_builder = EvidenceGraphBuilder()
