
# Read and analyze the branding and project files to extract key information
import json

# Create comprehensive PRD structure based on research and requirements
prd_structure = {
    "document_metadata": {
        "title": "Quikle AI Voice Agent Platform - Product Requirements Document",
        "version": "1.0",
        "target_agent": "Manus AI",
        "creation_date": "October 24, 2025",
        "document_type": "Master Prompt & PRD for Platform Replication"
    },
    
    "branding_summary": {
        "primary_color": "#191970 (Midnight Blue/Dark Navy)",
        "secondary_color": "#E27D60 (Coral/Terracotta)",
        "accent_color": "#41B3A3 (Teal/Aquamarine)",
        "heading_font": "Poppins",
        "body_font": "Lato",
        "brand_voice": "Expert but Accessible, Growth-Focused, Supportive, Practical, Professional"
    },
    
    "infrastructure_context": {
        "current_stack": "Docker + Cloudflare Tunnel + n8n",
        "architecture_philosophy": "Decoupled, security-first, containerization",
        "planned_migration": "Hostinger KVM 2 Linux VPS",
        "security_model": "Zero-Exposure via Cloudflare Tunnel"
    },
    
    "technical_requirements": {
        "latency_targets": {
            "standard": "800ms median voice-to-voice (target)",
            "acceptable_initial": "1500ms for proof of concept",
            "breakdown": {
                "stt": "100-400ms",
                "llm": "200-500ms (TTFT)",
                "tts": "200-300ms",
                "network": "50-200ms"
            }
        },
        "concurrency": {
            "standard_plan": "40 concurrent calls minimum",
            "enterprise_scale": "Thousands of concurrent calls"
        }
    }
}

print("PRD Structure Initialized - Key Components Extracted")
print(json.dumps(prd_structure, indent=2))
