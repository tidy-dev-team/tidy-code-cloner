import { once, showUI } from '@create-figma-plugin/utilities'

import { CloseHandler, PackPagesHandler, UnpackPagesHandler } from './types'

const TEMP_PAGE_NAME = '__TCC_TEMP__'

function isTempPage(page: PageNode): boolean {
  return page.name.trim() === TEMP_PAGE_NAME
}

function getOrCreateTempPage(): PageNode {
  const existingTempPage = figma.root.children.find((page) => isTempPage(page))
  if (existingTempPage !== undefined) {
    return existingTempPage
  }
  const page = figma.createPage()
  page.name = TEMP_PAGE_NAME
  figma.root.insertChild(figma.root.children.length, page)
  return page
}

function clearPage(page: PageNode): void {
  // PageNode doesn't have `removeAll()`; remove children one by one.
  const children = [...page.children]
  for (const child of children) {
    child.remove()
  }
}

function getUniquePageName(baseName: string): string {
  const trimmedBaseName = baseName.trim() === '' ? 'Untitled' : baseName.trim()
  const existingNames = new Set(figma.root.children.map((page) => page.name))
  if (existingNames.has(trimmedBaseName) === false) {
    return trimmedBaseName
  }
  let suffix = 2
  while (existingNames.has(`${trimmedBaseName} (Imported ${suffix})`)) {
    suffix += 1
  }
  return `${trimmedBaseName} (Imported ${suffix})`
}

function cloneTopLevelNodesIntoFrame(sourcePage: PageNode, targetFrame: FrameNode): void {
  // Clone only top-level nodes. This avoids bringing the whole page node itself.
  // `clone()` keeps locked/hidden status as-is.
  for (const node of sourcePage.children) {
    targetFrame.appendChild(node.clone())
  }
}

function stackFramesVertically(frames: Array<FrameNode>, spacing: number): void {
  let y = 0
  for (const frame of frames) {
    frame.x = 0
    frame.y = y
    // We don't resize frames in v1; just provide visual separation.
    y += frame.height + spacing
  }
}

function packPages(): void {
  const sourcePages = figma.root.children.filter((page) => isTempPage(page) === false)
  if (sourcePages.length === 0) {
    figma.notify('No pages found to pack.')
    return
  }

  const tempPage = getOrCreateTempPage()
  clearPage(tempPage)
  figma.currentPage = tempPage

  const frames: Array<FrameNode> = []

  for (const page of sourcePages) {
    const frame = figma.createFrame()
    frame.name = page.name
    // Use pluginData so unpack can prefer the original name.
    frame.setPluginData('tcc:pageName', page.name)

    // Keep the default fills/strokes. Users can ignore visuals.
    tempPage.appendChild(frame)

    cloneTopLevelNodesIntoFrame(page, frame)
    frames.push(frame)
  }

  stackFramesVertically(frames, 200)

  figma.currentPage.selection = frames
  figma.viewport.scrollAndZoomIntoView(frames)

  figma.notify(
    `Packed ${frames.length} page${frames.length === 1 ? '' : 's'} into ${TEMP_PAGE_NAME}. Copy selection (Cmd/Ctrl+C).`
  )
}

function unpackPages(): void {
  const tempPage = figma.root.children.find((page) => isTempPage(page))
  if (tempPage === undefined) {
    figma.notify(`Missing ${TEMP_PAGE_NAME} page. Paste your packed frames first.`)
    return
  }

  if (figma.currentPage.id !== tempPage.id) {
    figma.currentPage = tempPage
  }

  // Only unpack top-level frames.
  const frames = tempPage.children.filter((node): node is FrameNode => node.type === 'FRAME')

  if (frames.length === 0) {
    figma.notify(`No top-level frames found on ${TEMP_PAGE_NAME}.`)
    return
  }

  let createdPagesCount = 0

  for (const frame of frames) {
    const preferredName = frame.getPluginData('tcc:pageName') || frame.name
    const pageName = getUniquePageName(preferredName)

    const page = figma.createPage()
    page.name = pageName
    figma.root.insertChild(figma.root.children.length, page)

    // Move children from frame -> page.
    const children = [...frame.children]
    for (const child of children) {
      page.appendChild(child)
    }

    frame.remove()
    createdPagesCount += 1
  }

  figma.currentPage = figma.root.children[figma.root.children.length - 1]

  figma.notify(
    `Unpacked ${createdPagesCount} page${createdPagesCount === 1 ? '' : 's'} from ${TEMP_PAGE_NAME}.`
  )
}

export default function () {
  once<PackPagesHandler>('PACK_PAGES', function () {
    packPages()
  })

  once<UnpackPagesHandler>('UNPACK_PAGES', function () {
    unpackPages()
  })

  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    height: 156,
    width: 240
  })
}
