// Use strict construction to avoid any escape sequence confusion
const B = String.fromCharCode(92); // The backslash character: \
const BB = B + B; // Double backslash: \ (used for LaTeX newlines)
const NL = '\n'; // Newline for editor formatting

export interface SymbolCategory {
  name: string;
  symbols: { label: string; code: string }[];
}

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    name: 'Common',
    symbols: [
      { label: '+', code: '+' },
      { label: '-', code: '-' },
      { label: '=', code: '=' },
      { label: '×', code: B + 'times ' },
      { label: '÷', code: B + 'div ' },
      { label: '±', code: B + 'pm ' },
      { label: '√', code: B + 'sqrt{ }' },
      { label: 'x²', code: '^2' },
      { label: 'x_n', code: '_n' },
      { label: 'frac', code: B + 'frac }{ }' },
    ]
  },
  {
    name: 'Greek',
    symbols: [
      { label: 'α', code: B + 'alpha ' },
      { label: 'β', code: B + 'beta ' },
      { label: 'γ', code: B + 'gamma ' },
      { label: 'δ', code: B + 'delta ' },
      { label: 'θ', code: B + 'theta ' },
      { label: 'λ', code: B + 'lambda ' },
      { label: 'μ', code: B + 'mu ' },
      { label: 'π', code: B + 'pi ' },
      { label: 'σ', code: B + 'sigma ' },
      { label: 'ω', code: B + 'omega ' },
      { label: 'Δ', code: B + 'Delta ' },
      { label: 'Ω', code: B + 'Omega ' },
      { label: 'Σ', code: B + 'Sigma ' },
    ]
  },
  {
    name: 'Operators',
    symbols: [
      { label: '∫', code: B + 'int ' },
      { label: '∮', code: B + 'oint ' },
      { label: '∑', code: B + 'sum ' },
      { label: '∏', code: B + 'prod ' },
      { label: 'lim', code: B + 'lim_{x ' + B + 'to ' + B + 'infty} ' },
      { label: '∞', code: B + 'infty ' },
      { label: '∇', code: B + 'nabla ' },
      { label: '∂', code: B + 'partial ' },
    ]
  },
  {
    name: 'Relations',
    symbols: [
      { label: '≠', code: B + 'neq ' },
      { label: '≤', code: B + 'leq ' },
      { label: '≥', code: B + 'geq ' },
      { label: '≈', code: B + 'approx ' },
      { label: '≡', code: B + 'equiv ' },
      { label: '∈', code: B + 'in ' },
      { label: '∉', code: B + 'notin ' },
      { label: '⊂', code: B + 'subset ' },
      { label: '→', code: B + 'rightarrow ' },
      { label: '⇒', code: B + 'Rightarrow ' },
    ]
  },
  {
    name: 'Brackets',
    symbols: [
      { label: '( )', code: '()' },
      { label: '[ ]', code: '[]' },
      { label: '{ }', code: B + '{ ' + B + '}' },
      { label: '| |', code: '| |' },
      { label: '⟨ ⟩', code: B + 'langle ' + B + 'rangle' },
    ]
  },
  {
    name: 'Matrix',
    symbols: [
      {
        label: '[ ] 2x2',
        code: B + 'begin{bmatrix}' + NL + ' a & b ' + BB + NL + ' c & d ' + NL + B + 'end{bmatrix}'
      },
      {
        label: '( ) 2x2',
        code: B + 'begin{pmatrix}' + NL + ' a & b ' + BB + NL + ' c & d ' + NL + B + 'end{pmatrix}'
      },
      {
        label: 'Vector',
        code: B + 'begin{pmatrix}' + NL + ' a ' + BB + NL + ' b ' + NL + B + 'end{pmatrix}'
      },
      {
        label: 'Cases',
        code: B + 'begin{cases}' + NL + ' x & ' + B + 'text{if } x > 0 ' + BB + NL + ' -x & ' + B + 'text{if } x ' + B + 'leq 0 ' + NL + B + 'end{cases}'
      }
    ]
  }
];