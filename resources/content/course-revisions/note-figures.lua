-- Keep an original diagram together with its following source caption in PDF.
function Blocks(blocks)
  if not FORMAT:match('latex') then return nil end
  local result = pandoc.List()
  local i = 1
  while i <= #blocks do
    local image = blocks[i]
    local caption = blocks[i+1]
    local isImage = image.t == 'Para' and #image.content == 1 and image.content[1].t == 'Image'
    local isCaption = caption and caption.t == 'Para' and #caption.content == 1 and caption.content[1].t == 'Emph'
    if isImage and isCaption then
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
