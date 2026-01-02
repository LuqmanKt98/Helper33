import { base44 } from '@/api/base44Client';

export const autoCategorizeDocument = async (document, categories) => {
  if (!document || !categories || categories.length === 0) {
    return null;
  }

  try {
    // First, check rule-based categorization
    for (const category of categories.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0))) {
      if (!category.auto_categorization_rules || category.auto_categorization_rules.length === 0) {
        continue;
      }

      for (const rule of category.auto_categorization_rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))) {
        const fieldValue = document[rule.field] || '';
        const checkValue = rule.case_sensitive ? fieldValue : fieldValue.toLowerCase();
        const ruleValue = rule.case_sensitive ? rule.value : rule.value?.toLowerCase();

        let matches = false;

        switch (rule.condition) {
          case 'contains':
            matches = checkValue.includes(ruleValue);
            break;
          case 'equals':
            matches = checkValue === ruleValue;
            break;
          case 'includes_any':
            matches = rule.values?.some(v => 
              checkValue.includes(rule.case_sensitive ? v : v.toLowerCase())
            );
            break;
          case 'includes_all':
            matches = rule.values?.every(v => 
              checkValue.includes(rule.case_sensitive ? v : v.toLowerCase())
            );
            break;
        }

        if (matches) {
          return {
            category_id: category.id,
            category_name: category.category_name,
            auto_categorized: true,
            categorization_confidence: 0.95,
            categorization_method: 'rule_based'
          };
        }
      }
    }

    // If no rule matches, use AI categorization
    const aiCategories = categories.filter(c => c.ai_categorization_enabled);
    
    if (aiCategories.length === 0) {
      return null;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this document and categorize it into one of the provided categories.

Document Title: ${document.title}
Document Type: ${document.document_type || 'Unknown'}
Summary: ${document.ai_summary || 'No summary available'}
Key Points: ${document.key_points?.join(', ') || 'None'}
Tags: ${document.tags?.join(', ') || 'None'}
Extracted Text Preview: ${document.extracted_text?.substring(0, 200) || 'No text'}

Available Categories:
${aiCategories.map((c, idx) => `${idx + 1}. ${c.category_name} (${c.icon_emoji}) - ${c.description}`).join('\n')}

Choose the MOST appropriate category. If none fit well, return null.
Provide a confidence score (0-1) for your choice.`,
      response_json_schema: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description: "Name of the chosen category (exact match from list)"
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence in this categorization"
          },
          reasoning: {
            type: "string",
            description: "Brief explanation of why this category was chosen"
          }
        }
      }
    });

    if (response.category_name && response.confidence > 0.6) {
      const matchedCategory = aiCategories.find(
        c => c.category_name.toLowerCase() === response.category_name.toLowerCase()
      );

      if (matchedCategory) {
        return {
          category_id: matchedCategory.id,
          category_name: matchedCategory.category_name,
          auto_categorized: true,
          categorization_confidence: response.confidence,
          categorization_method: 'ai',
          categorization_reasoning: response.reasoning
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error auto-categorizing document:', error);
    return null;
  }
};

export const categorizeBulkDocuments = async (documents, categories) => {
  const results = [];
  
  for (const doc of documents) {
    if (doc.category_id) {
      // Skip already categorized documents
      continue;
    }

    const categoryData = await autoCategorizeDocument(doc, categories);
    
    if (categoryData) {
      try {
        await base44.entities.ScannedDocument.update(doc.id, categoryData);
        results.push({ doc_id: doc.id, success: true, category: categoryData.category_name });
      } catch (error) {
        results.push({ doc_id: doc.id, success: false, error: error.message });
      }
    }
  }

  return results;
};