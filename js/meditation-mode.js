(function() {
    const STACKED_LAYOUT_BREAKPOINT = 700;
    const DEFAULT_TEXT_PANEL_WIDTH = 38;
    const DEFAULT_TEXT_PANEL_HEIGHT = 44;
    const MIN_TEXT_PANEL_WIDTH = 20;
    const MAX_TEXT_PANEL_WIDTH = 55;
    const MIN_TEXT_PANEL_HEIGHT = 28;
    const MAX_TEXT_PANEL_HEIGHT = 65;

    const state = {
        built: false,
        active: false,
        shell: null,
        sourceArticle: null,
        textPanel: null,
        textArticle: null,
        gestureCanvas: null,
        canvasPanel: null,
        drawCanvas: null,
        resizeHandle: null,
        toolbar: null,
        toolbarToggle: null,
        colorPicker: null,
        colorSwatch: null,
        btnUndo: null,
        btnClear: null,
        btnDeeper: null,
        btnSurface: null,
        btnFontDown: null,
        btnFontUp: null,
        gesture: null,
        canvas: null,
        isResizing: false
    };

    function getPageContext() {
        const navRibbon = document.getElementById('navRibbon');
        const sourceArticle = document.querySelector('article.meditation-source-article') ||
            document.querySelector('article:not(.meditation-text)');

        if (!navRibbon || !sourceArticle) {
            return null;
        }

        if (!navRibbon.dataset || !navRibbon.dataset.book || !navRibbon.dataset.chapter) {
            return null;
        }

        return {
            navRibbon: navRibbon,
            sourceArticle: sourceArticle,
            treeContainer: document.getElementById('treeContainer')
        };
    }

    function isSupported() {
        return Boolean(getPageContext());
    }

    function isActive() {
        return state.active;
    }

    function enable() {
        const context = getPageContext();
        if (!context) {
            return false;
        }

        ensureBuilt(context);

        state.active = true;
        state.shell.hidden = false;
        state.shell.setAttribute('aria-hidden', 'false');
        document.body.classList.add('meditation-mode');
        if (context.treeContainer) {
            context.treeContainer.classList.remove('visible');
        }
        syncLayoutMode();
        state.canvas.resize();
        state.gesture.resize();
        window.scrollTo(0, 0);
        return true;
    }

    function disable() {
        state.active = false;
        state.isResizing = false;
        document.body.classList.remove('meditation-mode');
        document.body.style.cursor = '';
        if (state.shell) {
            state.shell.hidden = true;
            state.shell.setAttribute('aria-hidden', 'true');
        }
        return true;
    }

    function ensureBuilt(context) {
        if (state.built) {
            return;
        }

        state.sourceArticle = context.sourceArticle;
        state.sourceArticle.classList.add('meditation-source-article');

        buildShell();
        renderMeditationText();
        bindCanvasAndToolbar();
        bindResizeHandle();
        syncLayoutMode();

        state.built = true;
    }

    function buildShell() {
        const shell = document.createElement('div');
        shell.className = 'meditation-shell';
        shell.id = 'meditationShell';
        shell.hidden = true;
        shell.setAttribute('aria-hidden', 'true');

        shell.innerHTML = [
            '<div class="meditation-text-panel" id="meditationTextPanel">',
            '<article class="meditation-text" id="meditationText"></article>',
            '<canvas class="meditation-gesture-canvas" id="meditationGestureCanvas"></canvas>',
            '</div>',
            '<div class="meditation-resize-handle" id="meditationResizeHandle" role="separator" aria-label="Resize meditation panels"></div>',
            '<div class="meditation-canvas-panel" id="meditationCanvasPanel">',
            '<canvas class="meditation-draw-canvas" id="meditationDrawCanvas"></canvas>',
            '<button class="meditation-toolbar-toggle" id="meditationToolbarToggle" type="button">|||</button>',
            '<div class="meditation-toolbar collapsed" id="meditationToolbar">',
            '<div class="meditation-color-picker-wrap">',
            '<input class="meditation-color-picker" id="meditationColorPicker" type="color" value="#d4a017" aria-label="Meditation color">',
            '<div class="meditation-color-swatch" id="meditationColorSwatch" style="background:#d4a017"></div>',
            '</div>',
            '<div class="meditation-toolbar-sep"></div>',
            '<button class="meditation-toolbar-btn" id="meditationUndo" type="button">undo</button>',
            '<button class="meditation-toolbar-btn" id="meditationClear" type="button">clear</button>',
            '<div class="meditation-toolbar-sep"></div>',
            '<button class="meditation-toolbar-btn" id="meditationDeeper" type="button">deeper</button>',
            '<button class="meditation-toolbar-btn is-dim" id="meditationSurface" type="button">surface</button>',
            '<div class="meditation-toolbar-sep"></div>',
            '<button class="meditation-toolbar-btn" id="meditationFontDown" type="button">A-</button>',
            '<button class="meditation-toolbar-btn" id="meditationFontUp" type="button">A+</button>',
            '</div>',
            '</div>'
        ].join('');

        state.sourceArticle.parentNode.insertBefore(shell, state.sourceArticle);
        state.shell = shell;
        state.textPanel = shell.querySelector('#meditationTextPanel');
        state.textArticle = shell.querySelector('#meditationText');
        state.gestureCanvas = shell.querySelector('#meditationGestureCanvas');
        state.resizeHandle = shell.querySelector('#meditationResizeHandle');
        state.canvasPanel = shell.querySelector('#meditationCanvasPanel');
        state.drawCanvas = shell.querySelector('#meditationDrawCanvas');
        state.toolbar = shell.querySelector('#meditationToolbar');
        state.toolbarToggle = shell.querySelector('#meditationToolbarToggle');
        state.colorPicker = shell.querySelector('#meditationColorPicker');
        state.colorSwatch = shell.querySelector('#meditationColorSwatch');
        state.btnUndo = shell.querySelector('#meditationUndo');
        state.btnClear = shell.querySelector('#meditationClear');
        state.btnDeeper = shell.querySelector('#meditationDeeper');
        state.btnSurface = shell.querySelector('#meditationSurface');
        state.btnFontDown = shell.querySelector('#meditationFontDown');
        state.btnFontUp = shell.querySelector('#meditationFontUp');
    }

    function renderMeditationText() {
        const clone = state.sourceArticle.cloneNode(true);
        stripSourceClone(clone);

        const fragment = document.createDocumentFragment();
        const traversalState = {
            currentVerse: null
        };

        Array.from(clone.childNodes).forEach(function(node) {
            appendTopLevelNode(node, fragment, traversalState, false);
        });

        state.textArticle.innerHTML = '';
        state.textArticle.appendChild(fragment);
        state.textPanel.scrollTop = 0;
    }

    function stripSourceClone(clone) {
        clone.querySelectorAll([
            '.sidenote',
            '.marginnote',
            'label.margin-toggle',
            'input.margin-toggle',
            '.nav-ribbon-bottom'
        ].join(',')).forEach(function(node) {
            node.remove();
        });
    }

    function appendTopLevelNode(node, parent, traversalState, isQuoted) {
        if (node.nodeType === Node.TEXT_NODE) {
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        if (node.matches('section')) {
            Array.from(node.childNodes).forEach(function(child) {
                appendTopLevelNode(child, parent, traversalState, isQuoted);
            });
            return;
        }

        if (node.matches('blockquote')) {
            const quote = document.createElement('div');
            quote.className = 'meditation-quote';
            Array.from(node.childNodes).forEach(function(child) {
                appendTopLevelNode(child, quote, traversalState, true);
            });
            if (quote.childNodes.length > 0) {
                parent.appendChild(quote);
            }
            return;
        }

        if (node.matches('h1, h2, h3, h4, h5, h6')) {
            parent.appendChild(createHeadingClone(node));
            return;
        }

        if (node.matches('p.subtitle, p.psalm-subtitle')) {
            parent.appendChild(createSubtitleClone(node));
            return;
        }

        if (node.matches('p')) {
            const result = convertParagraph(node, traversalState.currentVerse, isQuoted);
            result.blocks.forEach(function(block) {
                parent.appendChild(block);
            });
            traversalState.currentVerse = result.currentVerse;
            return;
        }

        if (node.matches('hr')) {
            parent.appendChild(node.cloneNode(false));
            return;
        }

        Array.from(node.childNodes).forEach(function(child) {
            appendTopLevelNode(child, parent, traversalState, isQuoted);
        });
    }

    function createHeadingClone(sourceHeading) {
        const heading = document.createElement(sourceHeading.tagName.toLowerCase());
        heading.className = 'meditation-heading ' + sourceHeading.tagName.toLowerCase();
        heading.textContent = sourceHeading.textContent.trim();
        return heading;
    }

    function createSubtitleClone(sourceSubtitle) {
        const paragraph = document.createElement('p');
        paragraph.className = 'meditation-subtitle ' +
            (sourceSubtitle.classList.contains('psalm-subtitle') ? 'psalm-subtitle' : 'subtitle');
        paragraph.textContent = normalizeTextContent(sourceSubtitle.textContent);
        return paragraph;
    }

    function convertParagraph(paragraph, startingVerse, isQuoted) {
        const localState = {
            currentVerse: startingVerse,
            showVerseNumber: false,
            block: null,
            blocks: [],
            isQuoted: isQuoted
        };

        Array.from(paragraph.childNodes).forEach(function(node) {
            walkInlineNode(node, localState, {
                isRedLetter: false,
                isEmphasis: false,
                isStrong: false
            });
        });

        flushBlock(localState);

        return {
            blocks: localState.blocks,
            currentVerse: localState.currentVerse
        };
    }

    function walkInlineNode(node, localState, inlineState) {
        if (node.nodeType === Node.TEXT_NODE) {
            appendText(localState, inlineState, node.textContent || '');
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        if (node.classList.contains('verse')) {
            flushBlock(localState);
            localState.currentVerse = parseVerseNumber(node.id);
            localState.showVerseNumber = true;
            return;
        }

        if (node.tagName === 'BR') {
            const block = ensureBlock(localState);
            block.appendChild(document.createElement('br'));
            return;
        }

        if (node.classList.contains('selah')) {
            appendSelah(localState, node);
            return;
        }

        const nextInlineState = {
            isRedLetter: inlineState.isRedLetter || node.classList.contains('wj'),
            isEmphasis: inlineState.isEmphasis || node.tagName === 'EM' || node.tagName === 'I',
            isStrong: inlineState.isStrong || node.tagName === 'STRONG' || node.tagName === 'B'
        };

        Array.from(node.childNodes).forEach(function(child) {
            walkInlineNode(child, localState, nextInlineState);
        });
    }

    function parseVerseNumber(id) {
        const parsed = parseInt(String(id || '').replace(/^V/i, ''), 10);
        return Number.isNaN(parsed) ? null : parsed;
    }

    function ensureBlock(localState) {
        if (localState.block) {
            return localState.block;
        }

        const block = document.createElement('p');
        block.className = 'meditation-verse-block';
        if (localState.isQuoted) {
            block.classList.add('is-quoted');
        }

        if (localState.currentVerse !== null && localState.showVerseNumber) {
            const verseNum = document.createElement('span');
            verseNum.className = 'meditation-verse-num';
            verseNum.textContent = String(localState.currentVerse);
            block.appendChild(verseNum);
        } else if (localState.currentVerse === null) {
            block.classList.add('is-unnumbered');
        } else {
            block.classList.add('is-continuation');
        }

        block.dataset.renderable = 'false';
        localState.block = block;
        localState.showVerseNumber = false;
        return block;
    }

    function appendText(localState, inlineState, text) {
        if (!text) {
            return;
        }

        const pieces = text.replace(/\u00a0/g, ' ').split(/(\s+)/);
        pieces.forEach(function(piece) {
            if (!piece) {
                return;
            }

            const block = ensureBlock(localState);

            if (/^\s+$/.test(piece)) {
                block.appendChild(document.createTextNode(piece));
                return;
            }

            const word = document.createElement('span');
            word.className = 'word';
            if (inlineState.isRedLetter) {
                word.classList.add('wj');
            }
            if (inlineState.isEmphasis) {
                word.classList.add('word-emphasis');
            }
            if (inlineState.isStrong) {
                word.classList.add('word-strong');
            }
            if (localState.currentVerse !== null) {
                word.dataset.verse = String(localState.currentVerse);
            }
            word.dataset.word = piece;
            word.textContent = piece;
            block.dataset.renderable = 'true';
            block.appendChild(word);
        });
    }

    function appendSelah(localState, sourceNode) {
        const block = ensureBlock(localState);
        const selah = document.createElement('span');
        selah.className = 'selah meditation-selah';
        selah.textContent = normalizeTextContent(sourceNode.textContent);
        block.dataset.renderable = 'true';
        block.appendChild(selah);
    }

    function normalizeTextContent(text) {
        return String(text || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function flushBlock(localState) {
        if (!localState.block) {
            return;
        }

        if (localState.block.dataset.renderable === 'true') {
            localState.blocks.push(localState.block);
        }

        localState.block = null;
    }

    function bindCanvasAndToolbar() {
        state.canvas = new MeditationCanvas(state.drawCanvas);
        state.gesture = new GestureSelect(state.gestureCanvas, state.textArticle, state.canvasPanel);

        state.canvasPanel.addEventListener('droptext', function(event) {
            const detail = event.detail || {};
            state.canvas.addText(detail.phrase, detail.x, detail.y, detail.color);
        });

        bindToolbarAction(state.toolbarToggle, function() {
            state.toolbar.classList.toggle('collapsed');
        });

        state.colorPicker.addEventListener('input', function(event) {
            const color = event.target.value;
            state.colorSwatch.style.background = color;
            state.canvas.setColor(color);
            state.gesture.setColor(color);
        });

        bindToolbarAction(state.btnUndo, function() {
            state.canvas.undo();
        });

        bindToolbarAction(state.btnClear, function() {
            state.canvas.clearAll();
            updateSurfaceButton();
        });

        bindToolbarAction(state.btnDeeper, function() {
            state.canvas.goDeeper();
            updateSurfaceButton();
        });

        bindToolbarAction(state.btnSurface, function() {
            state.canvas.goSurface();
            updateSurfaceButton();
        });

        bindToolbarAction(state.btnFontDown, function() {
            if (state.canvas.selectedNode) {
                state.canvas.selectedNode.fontSize = Math.max(
                    8,
                    (state.canvas.selectedNode.fontSize || state.canvas.fontSize) - 2
                );
            } else {
                state.canvas.setFontSize(state.canvas.fontSize - 2);
            }
        });

        bindToolbarAction(state.btnFontUp, function() {
            if (state.canvas.selectedNode) {
                state.canvas.selectedNode.fontSize = Math.min(
                    72,
                    (state.canvas.selectedNode.fontSize || state.canvas.fontSize) + 2
                );
            } else {
                state.canvas.setFontSize(state.canvas.fontSize + 2);
            }
        });

        updateSurfaceButton();
        window.addEventListener('resize', function() {
            syncLayoutMode();
            state.canvas.resize();
            state.gesture.resize();
        });
    }

    function updateSurfaceButton() {
        const isDim = state.canvas.depthCount <= 1;
        state.btnSurface.classList.toggle('is-dim', isDim);
    }

    function bindResizeHandle() {
        function stopResizing() {
            if (!state.isResizing) {
                return;
            }

            state.isResizing = false;
            document.body.style.cursor = '';
            state.canvas.resize();
            state.gesture.resize();
        }

        state.resizeHandle.addEventListener('pointerdown', function(event) {
            const isMouse = event.pointerType === 'mouse';
            const isPen = event.pointerType === 'pen';

            if (!isMouse && !isPen) {
                return;
            }

            state.isResizing = true;
            document.body.style.cursor = isStackedLayout() ? 'row-resize' : 'col-resize';
            event.preventDefault();
        });

        document.addEventListener('pointermove', function(event) {
            if (!state.isResizing) {
                return;
            }

            if (isStackedLayout()) {
                resizeStackedPanels(event);
            } else {
                resizeHorizontalPanels(event);
            }

            state.canvas.resize();
            state.gesture.resize();
        });

        document.addEventListener('pointerup', function() {
            stopResizing();
        });

        document.addEventListener('pointercancel', function() {
            stopResizing();
        });

        window.addEventListener('blur', function() {
            stopResizing();
        });
    }

    function bindToolbarAction(element, handler) {
        if (!element) {
            return;
        }

        element.addEventListener('pointerup', function(event) {
            event.preventDefault();
            handler(event);
        });
    }

    function resizeHorizontalPanels(event) {
        const shellRect = state.shell.getBoundingClientRect();
        const position = ((event.clientX - shellRect.left) / shellRect.width) * 100;
        const percentage = clamp(position, MIN_TEXT_PANEL_WIDTH, MAX_TEXT_PANEL_WIDTH);
        state.textPanel.style.width = percentage + '%';
        state.textPanel.style.height = '';
    }

    function resizeStackedPanels(event) {
        const shellRect = state.shell.getBoundingClientRect();
        const position = ((event.clientY - shellRect.top) / shellRect.height) * 100;
        const percentage = clamp(position, MIN_TEXT_PANEL_HEIGHT, MAX_TEXT_PANEL_HEIGHT);
        state.textPanel.style.height = percentage + '%';
        state.textPanel.style.width = '';
    }

    function syncLayoutMode() {
        if (!state.textPanel) {
            return;
        }

        if (isStackedLayout()) {
            if (!state.textPanel.style.height) {
                state.textPanel.style.height = DEFAULT_TEXT_PANEL_HEIGHT + '%';
            }
            state.textPanel.style.width = '';
            state.resizeHandle.setAttribute('aria-orientation', 'horizontal');
        } else {
            if (!state.textPanel.style.width) {
                state.textPanel.style.width = DEFAULT_TEXT_PANEL_WIDTH + '%';
            }
            state.textPanel.style.height = '';
            state.resizeHandle.setAttribute('aria-orientation', 'vertical');
        }
    }

    function isStackedLayout() {
        return window.matchMedia('(max-width: ' + STACKED_LAYOUT_BREAKPOINT + 'px)').matches;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    class GestureSelect {
        constructor(gestureCanvas, article, dropTarget) {
            this.canvas = gestureCanvas;
            this.article = article;
            this.dropTarget = dropTarget;
            this.panel = gestureCanvas.parentElement;
            this.ctx = gestureCanvas.getContext('2d');
            this.points = [];
            this.isDrawing = false;
            this.color = '#d4a017';

            this.resize();
            this.setupEvents();
            window.addEventListener('resize', () => this.resize());
        }

        setColor(color) {
            this.color = color;
        }

        resize() {
            const panelRect = this.panel.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.canvas.style.left = panelRect.left + 'px';
            this.canvas.style.top = panelRect.top + 'px';
            this.canvas.style.width = panelRect.width + 'px';
            this.canvas.style.height = panelRect.height + 'px';
            this.canvas.width = panelRect.width * dpr;
            this.canvas.height = panelRect.height * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        screenToLocal(clientX, clientY) {
            const panelRect = this.panel.getBoundingClientRect();
            return {
                x: clientX - panelRect.left,
                y: clientY - panelRect.top
            };
        }

        setupEvents() {
            this.canvas.style.pointerEvents = 'none';

            this.panel.addEventListener('pointerdown', (event) => {
                const isPen = event.pointerType === 'pen';
                const isMouse = event.pointerType === 'mouse';
                if (!isPen && !isMouse) {
                    return;
                }
                if (isMouse && 'ontouchstart' in window) {
                    return;
                }

                this.resize();
                this.isDrawing = true;
                this.points = [];
                this.points.push(this.screenToLocal(event.clientX, event.clientY));
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                event.preventDefault();
            });

            document.addEventListener('pointermove', (event) => {
                if (!this.isDrawing) {
                    return;
                }
                this.points.push(this.screenToLocal(event.clientX, event.clientY));
                this.drawInk();
            });

            document.addEventListener('pointerup', () => {
                if (!this.isDrawing) {
                    return;
                }

                this.isDrawing = false;
                if (this.points.length < 5) {
                    this.fadeInk();
                    return;
                }

                const gesture = this.classifyGesture();
                const words = this.selectWords(gesture);
                if (words.length > 0) {
                    this.highlightAndAfford(words);
                }
                this.fadeInk();
            });
        }

        drawInk() {
            const ctx = this.ctx;
            const width = this.canvas.width / Math.min(window.devicePixelRatio || 1, 2);
            const height = this.canvas.height / Math.min(window.devicePixelRatio || 1, 2);
            ctx.clearRect(0, 0, width, height);
            if (this.points.length < 2) {
                return;
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let index = 1; index < this.points.length; index += 1) {
                ctx.lineTo(this.points[index].x, this.points[index].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        fadeInk() {
            let opacity = 0.6;
            const width = this.canvas.width / Math.min(window.devicePixelRatio || 1, 2);
            const height = this.canvas.height / Math.min(window.devicePixelRatio || 1, 2);

            const fade = () => {
                opacity -= 0.08;
                if (opacity <= 0) {
                    this.ctx.clearRect(0, 0, width, height);
                    return;
                }

                this.ctx.clearRect(0, 0, width, height);
                if (this.points.length < 2) {
                    return;
                }

                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.globalAlpha = opacity;
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[0].x, this.points[0].y);
                for (let index = 1; index < this.points.length; index += 1) {
                    this.ctx.lineTo(this.points[index].x, this.points[index].y);
                }
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
                requestAnimationFrame(fade);
            };

            requestAnimationFrame(fade);
        }

        classifyGesture() {
            const first = this.points[0];
            const last = this.points[this.points.length - 1];
            const closeDist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);

            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;

            this.points.forEach(function(point) {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });

            const width = maxX - minX;
            const height = maxY - minY;
            const diagonal = Math.sqrt(width * width + height * height);

            if (closeDist < diagonal * 0.4 && diagonal > 20) {
                return { type: 'lasso', polygon: this.points };
            }

            if (width > height * 2 && height < 40) {
                return {
                    type: 'underline',
                    minX: minX,
                    maxX: maxX,
                    y: (minY + maxY) / 2
                };
            }

            return { type: 'lasso', polygon: this.points };
        }

        selectWords(gesture) {
            const wordEls = this.article.querySelectorAll('.word');
            const panelRect = this.panel.getBoundingClientRect();
            const selected = [];

            wordEls.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2 - panelRect.left;
                const centerY = rect.top + rect.height / 2 - panelRect.top;

                if (gesture.type === 'lasso') {
                    if (this.pointInPolygon(centerX, centerY, gesture.polygon)) {
                        selected.push(element);
                    }
                    return;
                }

                const wordBottom = rect.bottom - panelRect.top;
                const wordLeft = rect.left - panelRect.left;
                const wordRight = rect.right - panelRect.left;
                if (
                    wordRight > gesture.minX &&
                    wordLeft < gesture.maxX &&
                    Math.abs(wordBottom - gesture.y) < 25
                ) {
                    selected.push(element);
                }
            });

            return selected;
        }

        pointInPolygon(x, y, polygon) {
            let inside = false;
            for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
                const current = polygon[index];
                const last = polygon[previous];
                if (
                    (current.y > y) !== (last.y > y) &&
                    x < ((last.x - current.x) * (y - current.y)) / (last.y - current.y) + current.x
                ) {
                    inside = !inside;
                }
            }
            return inside;
        }

        sanitizeDraggedWord(word) {
            return String(word || '').replace(/[.,;:!?'"“”‘’()\[\]\-–—…]/g, '');
        }

        highlightAndAfford(wordEls) {
            wordEls.forEach((element) => {
                element.classList.add('word-selected');
                element.style.setProperty('--sel-color', this.color);
            });

            const rects = Array.from(wordEls).map(function(element) {
                return element.getBoundingClientRect();
            });
            const maxX = Math.max.apply(null, rects.map(function(rect) { return rect.right; }));
            const minY = Math.min.apply(null, rects.map(function(rect) { return rect.top; }));
            const maxY = Math.max.apply(null, rects.map(function(rect) { return rect.bottom; }));

            const handle = document.createElement('div');
            handle.className = 'meditation-gesture-handle';
            handle.textContent = '>';
            handle.style.left = maxX + 'px';
            handle.style.top = ((minY + maxY) / 2) + 'px';
            handle.style.setProperty('--handle-color', this.color);
            document.body.appendChild(handle);

            const phrase = Array.from(wordEls).map(function(element) {
                return this.sanitizeDraggedWord(element.dataset.word);
            }, this).filter(Boolean).join(' ');

            let dragging = false;
            let ghost = null;

            const onDown = (event) => {
                event.preventDefault();
                dragging = true;
                ghost = document.createElement('div');
                ghost.className = 'meditation-drag-ghost';
                ghost.textContent = phrase;
                ghost.style.color = this.color;
                ghost.style.left = event.clientX + 'px';
                ghost.style.top = event.clientY + 'px';
                document.body.appendChild(ghost);
            };

            const onMove = (event) => {
                if (!dragging || !ghost) {
                    return;
                }
                ghost.style.left = event.clientX + 'px';
                ghost.style.top = event.clientY + 'px';
            };

            const onUp = (event) => {
                if (!dragging) {
                    return;
                }

                dragging = false;
                if (ghost) {
                    ghost.remove();
                }
                ghost = null;
                handle.remove();

                const canvasRect = this.dropTarget.getBoundingClientRect();
                if (
                    event.clientX >= canvasRect.left &&
                    event.clientX <= canvasRect.right &&
                    event.clientY >= canvasRect.top &&
                    event.clientY <= canvasRect.bottom
                ) {
                    this.dropTarget.dispatchEvent(new CustomEvent('droptext', {
                        detail: {
                            phrase: phrase,
                            color: this.color,
                            x: event.clientX,
                            y: event.clientY
                        }
                    }));
                }

                wordEls.forEach(function(element) {
                    element.classList.remove('word-selected');
                });
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
            };

            handle.addEventListener('pointerdown', onDown);
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);

            setTimeout(function() {
                if (document.body.contains(handle)) {
                    handle.remove();
                    wordEls.forEach(function(element) {
                        element.classList.remove('word-selected');
                    });
                }
            }, 5000);
        }
    }

    class MeditationCanvas {
        constructor(canvasEl) {
            this.canvasEl = canvasEl;
            this.ctx = canvasEl.getContext('2d');
            this.panX = 0;
            this.panY = 0;
            this.zoom = 1;
            this.currentStroke = null;
            this.drawColor = '#d4a017';
            this.drawWidth = 2.5;
            this.layers = [this.newLayer()];
            this.nodeIdCounter = 0;
            this.fontSize = 18;
            this.fontFamily = 'et-book, Georgia, serif';
            this.draggedTextNode = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.longPressTimer = null;
            this.selectedNode = null;
            this.isPanning = false;
            this.panStartX = 0;
            this.panStartY = 0;
            this.panStartPanX = 0;
            this.panStartPanY = 0;
            this.lastPinchDist = 0;

            this.resizeCanvas();
            this.setupEvents();
            this.drawLoop();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        newLayer() {
            return { strokes: [], textNodes: [], history: [] };
        }

        get layer() {
            return this.layers[this.layers.length - 1];
        }

        screenToWorld(screenX, screenY) {
            const rect = this.canvasEl.getBoundingClientRect();
            return {
                x: (screenX - rect.left - this.panX) / this.zoom,
                y: (screenY - rect.top - this.panY) / this.zoom
            };
        }

        worldToScreen(worldX, worldY) {
            return {
                x: worldX * this.zoom + this.panX,
                y: worldY * this.zoom + this.panY
            };
        }

        addText(text, screenX, screenY, color) {
            const world = this.screenToWorld(screenX, screenY);
            const node = {
                id: ++this.nodeIdCounter,
                text: text,
                x: world.x,
                y: world.y,
                color: color || '#d4a017',
                fontSize: this.fontSize
            };
            this.layer.textNodes.push(node);
            this.layer.history.push({ type: 'text', ref: node });
            return node.id;
        }

        clearAll() {
            this.layer.textNodes = [];
            this.layer.strokes = [];
            this.layer.history = [];
            this.selectedNode = null;
        }

        hitTestText(screenX, screenY) {
            const world = this.screenToWorld(screenX, screenY);
            for (let index = this.layer.textNodes.length - 1; index >= 0; index -= 1) {
                const node = this.layer.textNodes[index];
                const size = node.fontSize || this.fontSize;
                this.ctx.font = size + 'px ' + this.fontFamily;
                const metrics = this.ctx.measureText(node.text);
                const width = metrics.width;
                const height = size;
                if (
                    world.x >= node.x - width / 2 &&
                    world.x <= node.x + width / 2 &&
                    world.y >= node.y - height &&
                    world.y <= node.y + 4
                ) {
                    return node;
                }
            }
            return null;
        }

        goDeeper() {
            this.layers.push(this.newLayer());
        }

        goSurface() {
            if (this.layers.length <= 1) {
                return false;
            }
            this.layers.pop();
            if (this.selectedNode && this.layer.textNodes.indexOf(this.selectedNode) === -1) {
                this.selectedNode = null;
            }
            return true;
        }

        get depthCount() {
            return this.layers.length;
        }

        resizeCanvas() {
            const parent = this.canvasEl.parentElement;
            const width = parent.clientWidth;
            const height = parent.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvasEl.width = width * dpr;
            this.canvasEl.height = height * dpr;
            this.canvasEl.style.width = width + 'px';
            this.canvasEl.style.height = height + 'px';
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        redraw() {
            const ctx = this.ctx;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
            ctx.restore();

            const totalLayers = this.layers.length;
            for (let layerIndex = 0; layerIndex < totalLayers; layerIndex += 1) {
                const layer = this.layers[layerIndex];
                const depth = totalLayers - 1 - layerIndex;
                const scale = Math.pow(0.85, depth);
                const opacity = depth === 0 ? 1 : Math.max(0.1, 0.25 * Math.pow(0.5, depth - 1));

                layer.strokes.forEach((stroke) => {
                    this.drawStroke(stroke, scale, opacity);
                });
                layer.textNodes.forEach((node) => {
                    this.drawTextNode(node, scale, opacity);
                });
            }

            if (this.currentStroke) {
                this.drawStroke(this.currentStroke, 1, 1);
            }
        }

        applyAlphaToColor(color, alpha) {
            if (alpha >= 1) {
                return color;
            }

            const hex = color.replace('#', '');
            const red = parseInt(hex.substring(0, 2), 16);
            const green = parseInt(hex.substring(2, 4), 16);
            const blue = parseInt(hex.substring(4, 6), 16);
            return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
        }

        drawStroke(stroke, depthScale, alpha) {
            if (stroke.points.length < 2) {
                return;
            }

            const ctx = this.ctx;
            ctx.save();
            ctx.strokeStyle = this.applyAlphaToColor(stroke.color, alpha);
            ctx.lineWidth = stroke.width * this.zoom * depthScale;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            const firstPoint = this.worldToScreenDepth(stroke.points[0], depthScale);
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let index = 1; index < stroke.points.length; index += 1) {
                const point = this.worldToScreenDepth(stroke.points[index], depthScale);
                ctx.lineTo(point.x, point.y);
            }

            ctx.stroke();
            ctx.restore();
        }

        drawTextNode(node, depthScale, alpha) {
            const ctx = this.ctx;
            const screenPoint = this.worldToScreenDepth(node, depthScale);
            const fontSize = (node.fontSize || this.fontSize) * this.zoom * depthScale;

            ctx.save();
            ctx.font = fontSize + 'px ' + this.fontFamily;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (alpha >= 1) {
                ctx.shadowColor = 'rgba(0,0,0,0.45)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 1;
            }
            ctx.fillStyle = this.applyAlphaToColor(node.color, alpha);
            ctx.fillText(node.text, screenPoint.x, screenPoint.y);
            ctx.restore();

            if (node === this.selectedNode) {
                ctx.save();
                ctx.font = fontSize + 'px ' + this.fontFamily;
                const width = ctx.measureText(node.text).width;
                ctx.restore();
                const padding = 4;
                ctx.save();
                ctx.strokeStyle = node.color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]);
                ctx.strokeRect(
                    screenPoint.x - width / 2 - padding,
                    screenPoint.y - fontSize / 2 - padding,
                    width + padding * 2,
                    fontSize + padding * 2
                );
                ctx.restore();
            }
        }

        worldToScreenDepth(point, depthScale) {
            const screen = this.worldToScreen(point.x, point.y);
            if (depthScale === 1) {
                return screen;
            }

            const rect = this.canvasEl.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            return {
                x: centerX + (screen.x - centerX) * depthScale,
                y: centerY + (screen.y - centerY) * depthScale
            };
        }

        drawLoop() {
            this.redraw();
            requestAnimationFrame(() => this.drawLoop());
        }

        setupEvents() {
            const canvas = this.canvasEl;
            canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
            canvas.addEventListener('pointermove', (event) => this.onPointerMove(event));
            canvas.addEventListener('pointerup', (event) => this.onPointerUp(event));
            canvas.addEventListener('pointerleave', (event) => this.onPointerUp(event));
            canvas.addEventListener('contextmenu', (event) => event.preventDefault());

            canvas.addEventListener('touchstart', (event) => {
                event.preventDefault();
                if (event.touches.length === 2) {
                    const dx = event.touches[0].clientX - event.touches[1].clientX;
                    const dy = event.touches[0].clientY - event.touches[1].clientY;
                    this.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
                }
            }, { passive: false });

            canvas.addEventListener('wheel', (event) => {
                event.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                const factor = event.deltaY > 0 ? 0.9 : 1.1;
                const nextZoom = clamp(this.zoom * factor, 0.1, 5);
                const ratio = nextZoom / this.zoom;
                this.panX = mouseX - ratio * (mouseX - this.panX);
                this.panY = mouseY - ratio * (mouseY - this.panY);
                this.zoom = nextZoom;
            }, { passive: false });

            canvas.addEventListener('touchmove', (event) => {
                if (event.touches.length !== 2) {
                    return;
                }

                event.preventDefault();
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const factor = distance / this.lastPinchDist;
                this.lastPinchDist = distance;

                const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
                const rect = canvas.getBoundingClientRect();
                const mouseX = centerX - rect.left;
                const mouseY = centerY - rect.top;

                const nextZoom = clamp(this.zoom * factor, 0.1, 5);
                const ratio = nextZoom / this.zoom;
                this.panX = mouseX - ratio * (mouseX - this.panX);
                this.panY = mouseY - ratio * (mouseY - this.panY);
                this.zoom = nextZoom;
            }, { passive: false });
        }

        onPointerDown(event) {
            if (event.pointerType === 'pen') {
                event.preventDefault();
                this.canvasEl.setPointerCapture(event.pointerId);
                this.currentStroke = {
                    points: [this.screenToWorld(event.clientX, event.clientY)],
                    color: this.drawColor,
                    width: this.drawWidth
                };
                return;
            }

            if (event.pointerType === 'touch') {
                this.canvasEl.setPointerCapture(event.pointerId);
                const hit = this.hitTestText(event.clientX, event.clientY);
                if (hit) {
                    this.draggedTextNode = hit;
                    const world = this.screenToWorld(event.clientX, event.clientY);
                    this.dragOffsetX = hit.x - world.x;
                    this.dragOffsetY = hit.y - world.y;
                    this.startLongPress(hit);
                    return;
                }
                this.selectedNode = null;
                this.isPanning = true;
                this.panStartX = event.clientX;
                this.panStartY = event.clientY;
                this.panStartPanX = this.panX;
                this.panStartPanY = this.panY;
                return;
            }

            const hit = this.hitTestText(event.clientX, event.clientY);
            if (hit) {
                this.draggedTextNode = hit;
                const world = this.screenToWorld(event.clientX, event.clientY);
                this.dragOffsetX = hit.x - world.x;
                this.dragOffsetY = hit.y - world.y;
                this.startLongPress(hit);
                return;
            }

            this.selectedNode = null;
            this.isPanning = true;
            this.panStartX = event.clientX;
            this.panStartY = event.clientY;
            this.panStartPanX = this.panX;
            this.panStartPanY = this.panY;
        }

        onPointerMove(event) {
            if (this.draggedTextNode) {
                this.cancelLongPress();
                const world = this.screenToWorld(event.clientX, event.clientY);
                this.draggedTextNode.x = world.x + this.dragOffsetX;
                this.draggedTextNode.y = world.y + this.dragOffsetY;
                return;
            }

            if (this.isPanning) {
                this.panX = this.panStartPanX + (event.clientX - this.panStartX);
                this.panY = this.panStartPanY + (event.clientY - this.panStartY);
                return;
            }

            if (this.currentStroke) {
                this.currentStroke.points.push(this.screenToWorld(event.clientX, event.clientY));
            }
        }

        onPointerUp() {
            this.cancelLongPress();

            if (this.draggedTextNode) {
                this.draggedTextNode = null;
                return;
            }

            if (this.isPanning) {
                this.isPanning = false;
                return;
            }

            if (this.currentStroke) {
                if (this.currentStroke.points.length > 1) {
                    this.layer.strokes.push(this.currentStroke);
                    this.layer.history.push({ type: 'stroke', ref: this.currentStroke });
                }
                this.currentStroke = null;
            }
        }

        startLongPress(node) {
            this.cancelLongPress();
            this.longPressTimer = setTimeout(() => {
                this.selectedNode = node;
            }, 400);
        }

        cancelLongPress() {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        setColor(color) {
            this.drawColor = color;
        }

        setFontSize(size) {
            this.fontSize = clamp(size, 8, 72);
        }

        undo() {
            const entry = this.layer.history.pop();
            if (!entry) {
                return;
            }
            if (entry.type === 'stroke') {
                const strokeIndex = this.layer.strokes.indexOf(entry.ref);
                if (strokeIndex !== -1) {
                    this.layer.strokes.splice(strokeIndex, 1);
                }
                return;
            }
            const textIndex = this.layer.textNodes.indexOf(entry.ref);
            if (textIndex !== -1) {
                if (this.selectedNode === entry.ref) {
                    this.selectedNode = null;
                }
                this.layer.textNodes.splice(textIndex, 1);
            }
        }

        resize() {
            this.resizeCanvas();
        }
    }

    window.AlcyMeditationMode = {
        isSupported: isSupported,
        isActive: isActive,
        enable: enable,
        disable: disable
    };
})();
