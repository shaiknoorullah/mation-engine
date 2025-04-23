const data = {
  // === Core definition ===
  name: "Lead Record Processing Automation",
  description:
    "On lead.record.created.success → dedupe → domain‑based company lookup → Apollo enrich → score & route",
  version: 1,
  is_active: true,
  status: "ACTIVE",
  tenant_id: "tenant_123",
  tags: JSON.stringify(["lead", "enrichment", "recruitment"]),

  // === Trigger ===
  trigger_nodes: {
    create: {
      name: "Lead.created.success Trigger",
      trigger_type: "KAFKA_EVENT",
      kafka_topic: "leads-topic",
      kafka_event_type: "lead.record.created.success",
      configuration: {},
      tenant_id: "tenant_123",
    },
  },

  // === Conditions ===
  condition_nodes: {
    create: [
      {
        name: "Lead exists in DB?",
        condition_type: "SIMPLE",
        field_path: "data.lead.id",
        operator: "EXISTS",
        value_type: "STRING",
        tenant_id: "tenant_123",
      },
      {
        name: "Email syntax valid?",
        condition_type: "SIMPLE",
        field_path: "data.lead.email",
        operator: "MATCHES_REGEX",
        value: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        value_type: "STRING",
        tenant_id: "tenant_123",
      },
      {
        name: "Duplicate lead?",
        condition_type: "SIMPLE",
        field_path: "data.lead.isDuplicate",
        operator: "EQUALS",
        value: "false",
        value_type: "BOOLEAN",
        tenant_id: "tenant_123",
      },
      {
        name: "Company exists in DB?",
        condition_type: "SIMPLE",
        field_path: "extracted.domain",
        operator: "EXISTS",
        value_type: "STRING",
        tenant_id: "tenant_123",
      },
      {
        name: "Apollo found company?",
        condition_type: "SIMPLE",
        field_path: "apollo.company.id",
        operator: "EXISTS",
        value_type: "STRING",
        tenant_id: "tenant_123",
      },
      {
        name: "Enrichment succeeded?",
        condition_type: "SIMPLE",
        field_path: "apollo.enrichment.id",
        operator: "EXISTS",
        value_type: "STRING",
        tenant_id: "tenant_123",
      },
    ],
  },

  // === Actions ===
  action_nodes: {
    create: [
      {
        name: "Create new lead record",
        action_type: "DATA_UPDATE",
        parameters: { operation: "create", entity: "Lead", data: "data.lead" },
        tenant_id: "tenant_123",
      },
      {
        name: "Update existing lead timestamp",
        action_type: "UPDATE_LEAD",
        parameters: { field: "lastTouchedAt", value: "now()" },
        tenant_id: "tenant_123",
      },
      {
        name: "Merge with existing lead",
        action_type: "DATA_UPDATE",
        parameters: { operation: "merge", targetId: "data.existingLeadId" },
        tenant_id: "tenant_123",
      },
      {
        name: "Extract email domain",
        action_type: "CUSTOM_FUNCTION",
        service_name: "DomainExtractor",
        endpoint: "/extract",
        method: "POST",
        parameters: { email: "data.lead.email" },
        tenant_id: "tenant_123",
      },
      {
        name: "Attach existing company record",
        action_type: "UPDATE_LEAD",
        parameters: { field: "companyId", value: "data.company.id" },
        tenant_id: "tenant_123",
      },
      {
        name: "Fetch company via Apollo",
        action_type: "HTTP_REQUEST",
        service_name: "Apollo",
        endpoint: "/v1/company",
        method: "GET",
        parameters: { domain: "data.extracted.domain" },
        tenant_id: "tenant_123",
      },
      {
        name: "Create new company record",
        action_type: "CREATE_COMPANY",
        parameters: { data: "apollo.company" },
        tenant_id: "tenant_123",
      },
      {
        name: "Flag unknown company for ops",
        action_type: "NOTIFICATION_SEND",
        template_id: "manual_review_company",
        parameters: { to: "operations-team" },
        tenant_id: "tenant_123",
      },
      {
        name: "Enrich lead via Apollo",
        action_type: "HTTP_REQUEST",
        service_name: "Apollo",
        endpoint: "/v1/lead/enrich",
        method: "GET",
        parameters: { leadId: "data.lead.id", companyId: "data.company.id" },
        tenant_id: "tenant_123",
      },
      {
        name: "Flag enrichment failure",
        action_type: "NOTIFICATION_SEND",
        template_id: "manual_review_enrichment",
        parameters: { to: "operations-team" },
        tenant_id: "tenant_123",
      },
      {
        name: "Score lead",
        action_type: "CUSTOM_FUNCTION",
        service_name: "LeadScorer",
        endpoint: "/score",
        method: "POST",
        parameters: { lead: "apollo.enrichment" },
        tenant_id: "tenant_123",
      },
      {
        name: "Assign to Senior Recruiter queue",
        action_type: "ASSIGN_TO_USER",
        parameters: { queue: "SeniorRecruiters" },
        tenant_id: "tenant_123",
      },
      {
        name: "Assign to Standard Recruiter queue",
        action_type: "ASSIGN_TO_USER",
        parameters: { queue: "StandardRecruiters" },
        tenant_id: "tenant_123",
      },
      {
        name: "Notify recruiter",
        action_type: "NOTIFICATION_SEND",
        template_id: "notify_recruiter",
        parameters: { to: "assignedRecruiter" },
        tenant_id: "tenant_123",
      },
      {
        name: "Schedule follow‑up sequence",
        action_type: "CUSTOM_FUNCTION",
        service_name: "FollowUpScheduler",
        endpoint: "/schedule",
        method: "POST",
        parameters: { leadId: "data.lead.id" },
        tenant_id: "tenant_123",
      },
      {
        name: "Log metrics",
        action_type: "CUSTOM_FUNCTION",
        service_name: "MetricsService",
        endpoint: "/log",
        method: "POST",
        parameters: { events: ["lead.created", "company.enriched"] },
        tenant_id: "tenant_123",
      },
      {
        name: "Notify ops for manual review",
        action_type: "NOTIFICATION_SEND",
        template_id: "notify_ops",
        parameters: { to: "operations-team" },
        tenant_id: "tenant_123",
      },
    ],
  },

  // === (Optional) tiny delay before enrichment ===
  delay_nodes: {
    create: [
      {
        name: "Short pause before enrichment",
        delay_type: "FIXED",
        delay_seconds: 5,
        tenant_id: "tenant_123",
      },
    ],
  },

  // === Empty flow_graph shell (you can populate nodes/edges later in your React Flow UI) ===
  flow_graph: {
    create: {
      version: 1,
      viewport: {},
      metadata: {},
      nodes: { create: [] },
      edges: { create: [] },
      tenant_id: "tenant_123",
    },
  },
};
