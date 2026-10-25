-- Print layout only: keep every mathematical expression and paragraph.
local compactInline = false
function Meta(meta)
  compactInline = meta['compact-inline'] == true
end

local function imageParagraph(block)
  return block and block.t == 'Para' and #block.content == 1 and block.content[1].t == 'Image'
end

function Image(image)
  if not FORMAT:match('latex') then return nil end
  local width = image.attributes.width
  local fraction = width and tonumber(width:match('([%d%.]+)%%'))
  if fraction then
    local cap = image.src:match('w3%-oscillation') and 70 or 52
    image.attributes.width = tostring(math.min(fraction, cap)) .. '%'
  end
  return image
end

function Blocks(blocks)
  if not FORMAT:match('latex') then return nil end
  local result = pandoc.List()
  local i = 1
  while i <= #blocks do
    local image = blocks[i]
    local caption = blocks[i+1]
    local isImage = image.t == 'Para' and #image.content == 1 and image.content[1].t == 'Image'
    local isCaption = caption and caption.t == 'Para' and #caption.content == 1 and caption.content[1].t == 'Emph'
    if isImage and imageParagraph(caption) then
      image.content[1].attributes.width = '46%'
      caption.content[1].attributes.width = '46%'
      result:insert(pandoc.RawBlock('latex', '\\begin{center}'))
      result:insert(pandoc.Para({image.content[1], pandoc.RawInline('latex', '\\hfill'), caption.content[1]}))
      result:insert(pandoc.RawBlock('latex', '\\end{center}'))
      i = i + 2
    elseif isImage and isCaption then
      result:insert(pandoc.RawBlock('latex', '\\begin{center}\\begin{minipage}{\\linewidth}\\centering'))
      result:insert(image)
      result:insert(caption)
      result:insert(pandoc.RawBlock('latex', '\\end{minipage}\\end{center}'))
      i = i + 2
    else
      result:insert(image)
      i = i + 1
    end
  end
  return result
end

-- Short calculations inside prose need not each occupy a display line.
-- Long formulas, limits, definitions at the start of a section and aligned
-- derivations retain display style. The canonical Markdown is unchanged.
local function inlineCalculations(blocks)
  if not compactInline or not FORMAT:match('latex') then return nil end
  local result = pandoc.List()
  local joinContinuation = false
  for _, block in ipairs(blocks) do
    local previous = result[#result]
    local math = block.t == 'Para' and #block.content == 1 and block.content[1]
    local expression = math and math.t == 'Math' and math.text:match('^%s*(.-)%s*$') or ''
    if math and math.t == 'Math' and math.mathtype == 'DisplayMath'
      and #expression <= 85 and not expression:find('[\r\n]')
      and not math.text:match('\\begin') and not math.text:match('\\lim')
      and not math.text:match('\\sum') and not math.text:match('\\int')
      and not math.text:match('\\prod') and not math.text:match('\\boxed')
      and not math.text:match('\\qquad')
      and previous and previous.t == 'Para'
      and not imageParagraph(previous)
      and not pandoc.utils.stringify(previous):match('[%.%!%?]$') then
      previous.content:insert(pandoc.Space())
      previous.content:insert(pandoc.Math('InlineMath', expression))
      joinContinuation = true
    elseif joinContinuation and block.t == 'Para' and not imageParagraph(block)
      and pandoc.utils.stringify(block):match('^[a-z,;]') then
      previous.content:insert(pandoc.Space())
      previous.content:extend(block.content)
      joinContinuation = false
    else
      result:insert(block)
      joinContinuation = false
    end
  end
  return result
end

return {{Meta = Meta}, {Image = Image}, {Blocks = Blocks}, {Blocks = inlineCalculations}}
