/**
 * Template integration verification utility
 * This can be imported and used in React components or API routes to verify template functionality
 */

import { getAllTemplates, getTemplateById, getTemplatesByCategory } from '@/data/templates'

export interface TemplateTestResult {
  success: boolean
  message: string
  details?: any
}

/**
 * Test that the ERC-20 template is properly registered and accessible
 */
export function testErc20TemplateIntegration(): TemplateTestResult[] {
  const results: TemplateTestResult[] = []

  try {
    // Test 1: Verify template is in getAllTemplates()
    const allTemplates = getAllTemplates()
    const hasErc20Template = allTemplates.some(t => t.id === 'erc20-fixed-supply')
    
    results.push({
      success: hasErc20Template,
      message: 'ERC-20 template found in getAllTemplates()',
      details: { totalTemplates: allTemplates.length, templateIds: allTemplates.map(t => t.id) }
    })

    // Test 2: Verify template can be retrieved by ID
    const erc20Template = getTemplateById('erc20-fixed-supply')
    const templateFound = erc20Template !== null
    
    results.push({
      success: templateFound,
      message: 'ERC-20 template retrieved by ID',
      details: templateFound ? {
        id: erc20Template!.id,
        name: erc20Template!.name,
        category: erc20Template!.category,
        parametersCount: erc20Template!.parameters.length
      } : null
    })

    // Test 3: Verify template appears in token category
    const tokenTemplates = getTemplatesByCategory('token')
    const inTokenCategory = tokenTemplates.some(t => t.id === 'erc20-fixed-supply')
    
    results.push({
      success: inTokenCategory,
      message: 'ERC-20 template found in token category',
      details: { tokenTemplatesCount: tokenTemplates.length, tokenTemplateIds: tokenTemplates.map(t => t.id) }
    })

    // Test 4: Verify template structure
    if (erc20Template) {
      const requiredFields = ['id', 'name', 'description', 'category', 'version', 'abi', 'bytecode', 'parameters']
      const missingFields = requiredFields.filter(field => !erc20Template[field as keyof typeof erc20Template])
      
      results.push({
        success: missingFields.length === 0,
        message: 'ERC-20 template has all required fields',
        details: { missingFields, presentFields: requiredFields.filter(f => !missingFields.includes(f)) }
      })

      // Test 5: Verify constructor parameters
      const constructorParams = erc20Template.parameters.map(p => p.name)
      const expectedParams = ['name', 'symbol', 'totalSupply']
      const hasAllParams = expectedParams.every(param => constructorParams.includes(param))
      
      results.push({
        success: hasAllParams,
        message: 'ERC-20 template has correct constructor parameters',
        details: { 
          expected: expectedParams, 
          found: constructorParams,
          missing: expectedParams.filter(p => !constructorParams.includes(p))
        }
      })

      // Test 6: Verify ABI and bytecode
      const hasAbi = Array.isArray(erc20Template.abi) && erc20Template.abi.length > 0
      const hasBytecode = typeof erc20Template.bytecode === 'string' && erc20Template.bytecode.length > 0
      
      results.push({
        success: hasAbi,
        message: 'ERC-20 template has valid ABI',
        details: { abiLength: erc20Template.abi?.length || 0 }
      })

      results.push({
        success: hasBytecode,
        message: 'ERC-20 template has valid bytecode',
        details: { bytecodeLength: erc20Template.bytecode?.length || 0 }
      })
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'Template integration test failed with error',
      details: { error: error instanceof Error ? error.message : String(error) }
    })
  }

  return results
}

/**
 * Log template test results to console
 */
export function logTemplateTestResults(results: TemplateTestResult[]): void {
  console.log('🧪 ERC-20 Template Integration Test Results:')
  console.log('=' .repeat(50))
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} Test ${index + 1}: ${result.message}`)
    
    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2))
    }
  })
  
  const passedTests = results.filter(r => r.success).length
  const totalTests = results.length
  
  console.log('=' .repeat(50))
  console.log(`📊 Summary: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! ERC-20 template integration is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.')
  }
}

/**
 * Quick verification function that can be called from anywhere
 */
export function verifyErc20Template(): boolean {
  const results = testErc20TemplateIntegration()
  const allPassed = results.every(r => r.success)
  
  if (!allPassed) {
    console.warn('ERC-20 template verification failed:', results.filter(r => !r.success))
  }
  
  return allPassed
}