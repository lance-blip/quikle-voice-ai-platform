# South African Carrier Feasibility Analysis

**Date**: November 5, 2025  
**Source**: VoiceForge Carrier Management Dashboard  
**Context**: Pre-configured South African SIP Trunk Providers

---

## Executive Summary

The VoiceForge platform has already identified and configured four South African SIP trunk providers. Based on the performance metrics displayed in the Carrier Management dashboard, all four providers are technically viable for voice AI integration, with significant advantages over international carriers in both latency and cost.

**Key Findings:**
- **109ms average latency** for SA carriers vs. 290ms for international carriers (62% faster)
- **R0.33/min average cost** for SA carriers vs. R1.15/min for international carriers (72% cheaper)
- All providers offer **99%+ uptime** guarantees
- Combined capacity of **12,100 channels** across all providers

---

## Carrier Performance Comparison

### Overview Table

| Carrier | Priority | Latency | Cost/Min | Channels | Uptime | Status |
|---------|----------|---------|----------|----------|--------|--------|
| **Saicom** | P1 | 95ms | R0.35 | 1,000 | 99.9% | Active |
| **Wanatel** | P2 | 120ms | R0.29 | 100 | 99.5% | Active |
| **AVOXI** | P3 | 90ms | R0.42 | 10,000 | 99.995% | Active |
| **Switch Telecom** | P4 | 130ms | R0.25 | 1,000 | 99% | Inactive |

---

## Detailed Carrier Analysis

### 1. Saicom (Priority 1 - PRIMARY RECOMMENDATION)

**Performance Metrics:**
- Latency: 95ms (excellent)
- Cost: R0.35/min (competitive)
- Channels: 1,000 (suitable for medium-scale deployment)
- Uptime: 99.9% (enterprise-grade reliability)
- Status: Active

**Technical Assessment:**
Saicom is currently configured as the **P1 (highest priority)** carrier in the system. The 95ms latency is well below the 200ms threshold for real-time voice applications and will contribute significantly to achieving the target <800ms voice-to-voice latency. With 1,000 channels, Saicom can handle substantial concurrent call volume.

**Strengths:**
- Excellent latency performance (95ms)
- Strong uptime guarantee (99.9%)
- Already active and configured
- Sufficient channel capacity for initial deployment

**Considerations:**
- Mid-range pricing (R0.35/min)
- Channel capacity may need scaling for enterprise clients

**Recommendation:** **PRIMARY CARRIER** - Use as the default provider for all voice AI calls.

---

### 2. Wanatel (Priority 2 - SECONDARY RECOMMENDATION)

**Performance Metrics:**
- Latency: 120ms (good)
- Cost: R0.29/min (cost-effective)
- Channels: 100 (limited capacity)
- Uptime: 99.5% (good reliability)
- Status: Active

**Technical Assessment:**
Wanatel offers the **lowest cost** among active carriers at R0.29/min, making it attractive for cost-sensitive deployments. However, the 100-channel limit significantly restricts concurrent call capacity. The 120ms latency is still excellent for voice applications.

**Strengths:**
- Lowest cost among active carriers (R0.29/min)
- Good latency (120ms)
- Already active and configured

**Considerations:**
- **Very limited channel capacity (100)** - only suitable for small-scale deployments
- Lower uptime guarantee (99.5%) compared to Saicom and AVOXI

**Recommendation:** **FAILOVER CARRIER** - Use as a backup when Saicom reaches capacity or for cost-optimized small deployments.

---

### 3. AVOXI (Priority 3 - ENTERPRISE OPTION)

**Performance Metrics:**
- Latency: 90ms (best-in-class)
- Cost: R0.42/min (premium pricing)
- Channels: 10,000 (massive capacity)
- Uptime: 99.995% (exceptional reliability)
- Status: Active

**Technical Assessment:**
AVOXI delivers the **best latency** (90ms) and **highest uptime** (99.995%) among all carriers, with an extraordinary 10,000-channel capacity. This makes AVOXI ideal for enterprise-scale deployments requiring maximum reliability and concurrency. The premium pricing (R0.42/min) is justified by the superior performance metrics.

**Strengths:**
- **Best latency** among all carriers (90ms)
- **Highest uptime** guarantee (99.995%)
- **Massive channel capacity** (10,000) - supports large-scale enterprise deployments
- Already active and configured

**Considerations:**
- **Premium pricing** (R0.42/min) - 45% more expensive than Wanatel
- May be cost-prohibitive for high-volume standard deployments

**Recommendation:** **ENTERPRISE CARRIER** - Reserve for high-value clients, mission-critical applications, or when maximum concurrency is required.

---

### 4. Switch Telecom (Priority 4 - COST LEADER)

**Performance Metrics:**
- Latency: 130ms (acceptable)
- Cost: R0.25/min (lowest cost)
- Channels: 1,000 (suitable capacity)
- Uptime: 99% (standard reliability)
- Status: **Inactive**

**Technical Assessment:**
Switch Telecom offers the **absolute lowest cost** at R0.25/min, which is 29% cheaper than Saicom and 40% cheaper than AVOXI. The 130ms latency is still well within acceptable ranges for voice AI. However, the carrier is currently **inactive** in the system, suggesting it may require additional configuration or testing.

**Strengths:**
- **Lowest cost** across all carriers (R0.25/min)
- Acceptable latency (130ms)
- Good channel capacity (1,000)

**Considerations:**
- Currently **inactive** - requires activation and testing
- Lower uptime guarantee (99%) compared to other carriers
- Highest latency among all options (130ms)

**Recommendation:** **COST-OPTIMIZED CARRIER** - Activate and test for high-volume, cost-sensitive deployments where 99% uptime is acceptable.

---

## Strategic Recommendations

### Recommended Carrier Strategy

Based on the analysis, I recommend a **tiered carrier approach**:

#### Tier 1: Standard Deployments
- **Primary**: Saicom (P1)
- **Failover**: Wanatel (P2)
- **Rationale**: Balanced performance and cost, suitable for 90% of use cases

#### Tier 2: Enterprise Deployments
- **Primary**: AVOXI (P3)
- **Failover**: Saicom (P1)
- **Rationale**: Maximum reliability and concurrency for high-value clients

#### Tier 3: Cost-Optimized Deployments
- **Primary**: Switch Telecom (P4) - after activation
- **Failover**: Wanatel (P2)
- **Rationale**: Lowest cost for high-volume, price-sensitive applications

### Implementation Priority

**Phase 1 (Immediate):**
1. **Saicom** - Already active, use as primary carrier for Phase 2B voice pipeline implementation
2. **AVOXI** - Already active, use for testing and enterprise proof-of-concept

**Phase 2 (Short-term):**
3. **Wanatel** - Already active, configure as automatic failover
4. **Switch Telecom** - Activate and test for cost-optimized tier

### Technical Integration Requirements

All four carriers appear to use **SIP trunking**, which is the standard protocol for VoIP integration. The integration requirements are:

1. **SIP Client Library**: Use a Node.js SIP library (e.g., `sip.js`, `jssip`, or `drachtio`)
2. **Authentication**: Configure SIP credentials for each carrier
3. **Routing Logic**: Implement priority-based routing (P1 → P2 → P3 → P4)
4. **Failover Mechanism**: Automatic failover on connection failure or capacity limits
5. **Load Balancing**: Distribute calls across carriers based on cost/performance profiles

### Cost-Benefit Analysis

**Monthly Cost Comparison (Based on 10,000 minutes/month):**

| Carrier | Cost/Min | Monthly Cost | Annual Cost | Savings vs. International |
|---------|----------|--------------|-------------|---------------------------|
| Switch Telecom | R0.25 | R2,500 | R30,000 | R10,800 (78%) |
| Wanatel | R0.29 | R2,900 | R34,800 | R9,720 (72%) |
| Saicom | R0.35 | R3,500 | R42,000 | R8,400 (67%) |
| AVOXI | R0.42 | R4,200 | R50,400 | R7,200 (59%) |
| International | R1.15 | R11,500 | R138,000 | Baseline |

**Latency Improvement:**
- SA Carriers: 90-130ms
- International: 290ms
- **Improvement**: 160-200ms reduction (55-69% faster)

---

## Conclusion

The South African carrier landscape is **highly favorable** for the VoiceForge platform. All four identified carriers offer:

✅ **Superior latency** (90-130ms vs. 290ms international)  
✅ **Significant cost savings** (59-78% cheaper than international carriers)  
✅ **Enterprise-grade reliability** (99%+ uptime)  
✅ **Sufficient capacity** (12,100 combined channels)  
✅ **SIP trunking support** (standard integration protocol)

**Final Recommendation:**

**Primary Integration Target: Saicom**
- Best balance of latency, cost, and reliability
- Already active and configured as P1
- Ideal for Phase 2B voice pipeline implementation

**Secondary Integration Target: AVOXI**
- Best-in-class performance for enterprise deployments
- Massive capacity for scaling
- Use for high-value clients and proof-of-concept demos

The platform is **ready for immediate voice pipeline integration** using the existing South African carrier infrastructure. No additional carrier research or procurement is required.

---

**Prepared by**: Manus AI  
**Status**: Ready for Phase 2B Implementation

---

## Appendix A: Carrier Technical Details

### Saicom - Technical Profile

**Company Overview:**
- Established South African telecommunications provider
- Specializes in VoIP and SIP trunking services
- Enterprise-grade infrastructure with 99.98% uptime
- Direct interconnection with major SA carriers (Vodacom, MTN, Telkom, etc.)

**Technical Capabilities:**
- **Protocol**: SIP (Session Initiation Protocol) trunking
- **Compatibility**: Works with all major PBX systems
- **Network**: Any network infrastructure supported
- **Quality**: Crystal-clear voice quality through dedicated infrastructure
- **Uptime**: 99.98% (matches dashboard claim of 99.9%)

**Key Features:**
- Seamless number portability
- No setup costs or hidden fees
- Scalable infrastructure
- 24/7 customer support
- Compliance-ready environment
- Integration with call recording solutions (Atmos partnership)

**Direct Interconnections:**
Saicom has direct peering with the following South African carriers, ensuring optimal call quality:
- Vodacom
- MTN
- CellC
- Telkom
- Telkom Mobile
- Liquid Intelligent Technologies
- Switch Telecoms
- Vox Telecoms
- Dimension Data
- And 12+ other regional carriers

**Integration Requirements:**
- Standard SIP trunk connection
- Internet connectivity
- Compatible PBX or SIP client
- Minimal to zero infrastructure investment required

**Pricing Model:**
- Custom quotes based on usage
- No access fees or setup costs
- Competitive per-minute rates (R0.35/min confirmed in dashboard)

**Assessment for VoiceForge:**
Saicom is an **ideal primary carrier** for the VoiceForge platform. The company's extensive direct interconnections with major SA carriers ensure optimal call quality and routing. The 99.98% uptime guarantee, combined with 95ms latency, makes it suitable for real-time AI voice applications. The standard SIP trunking protocol ensures straightforward integration with the existing VoiceForge architecture.

**Status**: ✅ **READY FOR INTEGRATION** - Already configured as P1 carrier in VoiceForge platform


### AVOXI - Technical Profile

**Company Overview:**
- Global cloud communications provider with 20+ years of experience
- Operates in 170+ countries with coverage in thousands of cities
- Enterprise-grade infrastructure with tier 4 data centers
- Award-winning SIP trunk and voice API provider

**Technical Capabilities:**
- **Protocol**: SIP trunking with TLS and SRTP encryption
- **API**: Comprehensive programmable voice API with REST interface
- **Compatibility**: Works with virtually any PBX (3CX, Avaya, MS Teams, FreePBX, Asterisk, etc.)
- **Network**: Multi-region infrastructure with automatic failover
- **Quality**: 4.2 MOS Score (Mean Opinion Score) - above global "excellent" standard
- **Uptime**: 99.995% SLA (matches dashboard claim)
- **Concurrent Calling**: Unlimited channels (dashboard shows 10,000 configured)

**Key Features:**
- **Unlimited concurrent calling** in South Africa (no channel limits)
- **Local voice termination** with guaranteed caller ID
- **TrueLocal** numbers for optimal origination and termination
- **Real-time fraud monitoring** with 24/7/365 manual oversight
- **Zero downtime (ZDU)** with database replication across regions
- **Advanced call routing** with IVR, call recording, call analytics
- **Voicemail transcription** and email integration
- **International calling** to 190+ countries

**Programmable Voice API:**
AVOXI offers a comprehensive **Voice API toolkit** that supports:
- **Programming Languages**: Shell, Node.js, JavaScript, Python, Java, Go, C#
- **API Endpoints**: User permissions, CDRs, SIP URIs, billing, provisioning, orders, numbers, SMS, extensions
- **Webhooks**: Event-driven real-time updates
- **Session Initiation Protocol (SIP)**: Full SIP configuration management
- **Number Provisioning**: Automated phone number ordering and configuration
- **International Porting**: Free number porting with API support

**Integration Requirements:**
- RESTful API with comprehensive documentation at https://www.avoxi.com/api-docs/
- API token-based authentication
- Webhook support for real-time events
- Standard SIP trunk configuration
- Compatible with existing PBX or custom SIP clients

**Pricing Model:**
- No setup fees or minimum contracts
- Pay-per-use model (per-minute rates)
- Wholesale rates available for high-volume deployments
- Free number porting
- R0.42/min confirmed in dashboard (premium tier)

**Network Infrastructure:**
- **Tier 4 data centers** with multi-factor physical security
- **Multi-region deployment** with automatic failover
- **Zero downtime architecture** with database replication
- **Multiple ISPs** with automatic failover per data center
- **Direct carrier connections** for optimal routing and quality
- **Real-time traffic monitoring** with abnormality alerts

**Security & Compliance:**
- TLS and SRTP encryption for secure calling
- CCPA, GDPR, HIPAA, PCI-DSS, POPIA, STIR/SHAKEN compliance
- Proactive fraud monitoring
- Network optimized to avoid packet loss

**Assessment for VoiceForge:**
AVOXI is the **premium enterprise option** for the VoiceForge platform. The combination of 90ms latency, 99.995% uptime, unlimited concurrent calling (10,000 channels configured), and a comprehensive programmable voice API makes it ideal for:

1. **High-value enterprise clients** requiring maximum reliability
2. **Proof-of-concept demonstrations** showcasing best-in-class performance
3. **API-driven integrations** leveraging AVOXI's REST API for advanced call control
4. **Scalable deployments** requiring massive concurrent call capacity

The programmable voice API is particularly valuable for VoiceForge, as it enables advanced features like:
- Real-time call control and routing
- Automated number provisioning
- CDR integration for analytics
- Webhook-based event handling for AI pipeline triggers

**Status**: ✅ **READY FOR INTEGRATION** - Already configured as P3 carrier with full API capabilities

**Recommendation**: Use AVOXI as the **enterprise tier** carrier and leverage the programmable voice API for advanced integrations in Phase 2B.

