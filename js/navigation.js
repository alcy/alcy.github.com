/**
 * Bible Navigation with D3 Tree
 * Reads current book/chapter from nav-ribbon data attributes
 */

// Book name to code mapping for generating URLs
const bookCodeMap = {
    'Genesis': 'gen', 'Exodus': 'exo', 'Leviticus': 'lev', 'Numbers': 'num',
    'Deuteronomy': 'deu', 'Joshua': 'jos', 'Judges': 'jdg', 'Ruth': 'rut',
    '1 Samuel': '1sa', '2 Samuel': '2sa', '1 Kings': '1ki', '2 Kings': '2ki',
    '1 Chronicles': '1ch', '2 Chronicles': '2ch', 'Ezra': 'ezr', 'Nehemiah': 'neh',
    'Esther': 'est', 'Job': 'job', 'Psalms': 'psa', 'Proverbs': 'pro',
    'Ecclesiastes': 'ecc', 'Song of Solomon': 'sng', 'Isaiah': 'isa',
    'Jeremiah': 'jer', 'Lamentations': 'lam', 'Ezekiel': 'ezk', 'Daniel': 'dan',
    'Hosea': 'hos', 'Joel': 'jol', 'Amos': 'amo', 'Obadiah': 'oba',
    'Jonah': 'jon', 'Micah': 'mic', 'Nahum': 'nam', 'Habakkuk': 'hab',
    'Zephaniah': 'zep', 'Haggai': 'hag', 'Zechariah': 'zec', 'Malachi': 'mal',
    'Matthew': 'mat', 'Mark': 'mrk', 'Luke': 'luk', 'John': 'jhn',
    'Acts': 'act', 'Romans': 'rom', '1 Corinthians': '1co', '2 Corinthians': '2co',
    'Galatians': 'gal', 'Ephesians': 'eph', 'Philippians': 'php', 'Colossians': 'col',
    '1 Thessalonians': '1th', '2 Thessalonians': '2th', '1 Timothy': '1ti',
    '2 Timothy': '2ti', 'Titus': 'tit', 'Philemon': 'phm', 'Hebrews': 'heb',
    'James': 'jas', '1 Peter': '1pe', '2 Peter': '2pe', '1 John': '1jn',
    '2 John': '2jn', '3 John': '3jn', 'Jude': 'jud', 'Revelation': 'rev'
};

// Get current book and chapter from the nav ribbon element
const navRibbon = document.getElementById('navRibbon');
const currentBook = navRibbon.getAttribute('data-book');
const currentChapter = navRibbon.getAttribute('data-chapter');

// Function to generate chapter URL
function getChapterUrl(bookName, chapterNum) {
    const bookCode = bookCodeMap[bookName];
    if (!bookCode) return null;

    // Pad chapter number to 2 digits (except for Psalms which uses 3)
    const paddedChapter = bookName === 'Psalms'
        ? String(chapterNum).padStart(3, '0')
        : String(chapterNum).padStart(2, '0');

    return `${bookCode}${paddedChapter}.htm`;
}

// Toggle tree visibility
const navAid = document.getElementById('navAid');
const treeContainer = document.getElementById('treeContainer');

// Function to toggle tree
function toggleTree() {
    treeContainer.classList.toggle('visible');

    // If tree just became visible, scroll to current chapter
    if (treeContainer.classList.contains('visible')) {
        setTimeout(() => {
            const currentNode = treeContainer.querySelector('.node.current');
            if (currentNode) {
                currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100); // Small delay to let D3 finish rendering
    }
}

// Add click handlers to nav text only (not the whole ribbon, to allow arrow clicks)
const navRibbonText = navRibbon.querySelector('.nav-text');
const navAidText = navAid ? navAid.querySelector('.nav-text') : null;

if (navRibbonText) {
    navRibbonText.addEventListener('click', toggleTree);
}
if (navAidText) {
    navAidText.addEventListener('click', toggleTree);
}

// Close tree if clicking outside
document.addEventListener('click', (e) => {
    if (!navAid.contains(e.target) && !navRibbon.contains(e.target) && !treeContainer.contains(e.target)) {
        treeContainer.classList.remove('visible');
    }
});

// D3 Tree Setup
const width = 300;
const dx = 20;
const dy = width / 6;
const margin = {top: 10, right: 10, bottom: 10, left: 40};

const tree = d3.tree().nodeSize([dx, dy]);
const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

// Restructure Psalms into book groups for better navigation
const psalmsBook = bibleData.children.find(book => book.name === 'Psalms');
if (psalmsBook && psalmsBook.children) {
    const allChapters = psalmsBook.children;
    const groups = [
        { name: '1-41', start: 1, end: 41 },
        { name: '42-72', start: 42, end: 72 },
        { name: '73-89', start: 73, end: 89 },
        { name: '90-106', start: 90, end: 106 },
        { name: '107-150', start: 107, end: 150 }
    ];

    psalmsBook.children = groups.map(group => ({
        name: group.name,
        children: allChapters.filter(ch => {
            const chNum = parseInt(ch.name);
            return chNum >= group.start && chNum <= group.end;
        })
    }));
}

const root = d3.hierarchy(bibleData);

root.x0 = 0;
root.y0 = 0;

// Assign IDs and set up initial collapsed state
root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;

    // Start with everything collapsed except path to current book/chapter
    if (d.depth === 0) {
        // Root: keep children visible (all books)
        d.children = d._children;
    } else if (d.depth === 1) {
        // Book level: only expand current book
        if (d.data.name === currentBook) {
            d.children = d._children;
        } else {
            d.children = null;
        }
    } else if (d.depth === 2) {
        // For Psalms book groups, expand if current book is Psalms
        // For regular books, this is the chapter level (always collapsed)
        const isPsalmsGroup = d.parent && d.parent.data.name === 'Psalms';
        if (isPsalmsGroup && currentBook === 'Psalms') {
            // Check if current chapter falls in this group's range
            const groupRange = d.data.name.split('-').map(n => parseInt(n));
            const currentChNum = parseInt(currentChapter);
            if (currentChNum >= groupRange[0] && currentChNum <= groupRange[1]) {
                d.children = d._children;
            } else {
                d.children = null;
            }
        } else {
            d.children = null;
        }
    } else if (d.depth === 3) {
        // Psalms chapter level: always collapsed
        d.children = null;
    }
});

const svg = d3.select("#tree")
    .attr("width", width)
    .attr("viewBox", [-margin.left, -margin.top, width, dx])
    .style("font", "11px et-book, Palatino, Georgia, serif")
    .style("user-select", "none");

const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5);

const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

function update(event, source) {
    const duration = event?.altKey ? 2500 : 250;
    // Filter out the root node (Bible) - only show books and chapters
    const nodes = root.descendants().filter(d => d.depth > 0).reverse();
    const links = root.links().filter(d => d.source.depth > 0);

    // Compute the new tree layout
    tree(root);

    // Adjust position for expanded Psalms groups to extend their branch
    root.descendants().forEach(d => {
        const isPsalmsGroup = d.depth === 2 && d.parent && d.parent.data.name === 'Psalms';
        if (isPsalmsGroup && d.children) {
            // Shift expanded groups to the right by adding to y position
            d.y += 35;
        }
    });

    let left = root;
    let right = root;
    root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + margin.top + margin.bottom;

    const transition = svg.transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height]);

    // Update nodes
    const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

    // Enter new nodes
    const nodeEnter = node.enter().append("g")
        .attr("class", d => {
            let classes = "node";
            // Add chapter class for chapter nodes (depth 2 for regular books, depth 3 for Psalms)
            if (d.depth === 2) {
                const isPsalmsGroup = d.parent && d.parent.data.name === 'Psalms';
                if (!isPsalmsGroup) {
                    // Regular book chapter
                    classes += " chapter";
                    // Mark current chapter
                    if (d.parent.data.name === currentBook && d.data.name === currentChapter) {
                        classes += " current";
                    }
                }
            } else if (d.depth === 3) {
                // Psalms chapter
                classes += " chapter";
                // Mark current chapter (check grandparent for book name)
                if (d.parent.parent.data.name === currentBook && d.data.name === currentChapter) {
                    classes += " current";
                }
            }
            return classes;
        })
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
            // Psalms chapter nodes (depth 3): navigate to chapter
            if (d.depth === 3) {
                const bookName = d.parent.parent.data.name; // Psalms
                const chapterNum = d.data.name;
                const url = getChapterUrl(bookName, chapterNum);
                if (url) {
                    window.location.href = url;
                }
                event.stopPropagation();
            }
            // Depth 2: could be Psalms groups (expandable) or regular chapters (navigable)
            else if (d.depth === 2) {
                const isPsalmsGroup = d.parent && d.parent.data.name === 'Psalms';

                if (isPsalmsGroup) {
                    // Psalms group: collapse all other Psalms groups (accordion behavior)
                    d.parent.children.forEach(group => {
                        if (group !== d && group.children) {
                            group.children = null;
                        }
                    });

                    // Then toggle the clicked group
                    if (d.children) {
                        d.children = null;
                    } else {
                        d.children = d._children;
                    }
                    update(event, d);
                } else {
                    // Regular book chapter: navigate to chapter
                    const bookName = d.parent.data.name;
                    const chapterNum = d.data.name;
                    const url = getChapterUrl(bookName, chapterNum);
                    if (url) {
                        window.location.href = url;
                    }
                    event.stopPropagation();
                }
            }
            // Book nodes (depth 1): toggle expand/collapse
            else if (d.depth === 1) {
                // First, collapse all other books (accordion behavior)
                root.children.forEach(book => {
                    if (book !== d && book.children) {
                        book.children = null;
                    }
                });

                // Then toggle the clicked book
                if (d.children) {
                    d.children = null;
                } else {
                    d.children = d._children;
                }
                update(event, d);
            }
        });

    nodeEnter.append("circle")
        .attr("r", 2.5)
        .attr("fill", d => d._children ? "#555" : "#999")
        .attr("stroke-width", 10);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => {
            // Psalms groups appear on the right
            const isPsalmsGroup = d.depth === 2 && d.parent && d.parent.data.name === 'Psalms';
            if (isPsalmsGroup) return 6;
            return d._children ? -6 : 6;
        })
        .attr("text-anchor", d => {
            const isPsalmsGroup = d.depth === 2 && d.parent && d.parent.data.name === 'Psalms';
            if (isPsalmsGroup) return "start";
            return d._children ? "end" : "start";
        })
        .text(d => {
            // Hide Psalms group names when expanded
            const isPsalmsGroup = d.depth === 2 && d.parent && d.parent.data.name === 'Psalms';
            if (isPsalmsGroup && d.children) return '';
            return d.data.name;
        })
        .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

    // Update text for all nodes (hide Psalms group names when expanded)
    // Use selectAll to update both the main text and the cloned outline text
    node.merge(nodeEnter).selectAll("text")
        .text(d => {
            // Hide Psalms group names when expanded
            const isPsalmsGroup = d.depth === 2 && d.parent && d.parent.data.name === 'Psalms';
            if (isPsalmsGroup && d.children) return '';
            return d.data.name;
        });

    // Transition nodes to their new position
    node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

    // Transition exiting nodes
    node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    // Update links
    const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

    link.exit().transition(transition).remove()
        .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        });

    // Stash old positions for transition
    root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Initial render
update(null, root);

// Verse highlighting and scrolling
// When a page loads with a verse hash (e.g., #V22 or #v22), highlight that verse
function highlightVerse() {
    const hash = window.location.hash;

    if (!hash || !hash.startsWith('#')) {
        return;
    }

    // Support both uppercase and lowercase verse IDs (e.g., #V22 or #v22)
    const verseId = hash.substring(1).toUpperCase();

    if (!verseId.startsWith('V')) {
        return;
    }

    // Find the verse span
    const verseSpan = document.getElementById(verseId);

    if (!verseSpan) {
        return;
    }

    // Find the text content after the verse marker
    // We need to wrap the content from this verse to the next verse (or end of paragraph)
    // Create a wrapper span to highlight just this verse's content

    // Get all content after this verse marker until the next verse marker
    let parent = verseSpan.parentElement;
    let textToHighlight = [];
    let currentNode = verseSpan.nextSibling;

    // Collect text/nodes until we hit another verse marker or run out of siblings
    while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE &&
            currentNode.classList &&
            currentNode.classList.contains('verse')) {
            // Hit the next verse marker, stop
            break;
        }
        textToHighlight.push(currentNode);
        currentNode = currentNode.nextSibling;
    }

    // If we found content, wrap it in a span for highlighting
    if (textToHighlight.length > 0) {
        const wrapper = document.createElement('span');
        wrapper.classList.add('verse-highlight');

        // Insert wrapper before the first node
        parent.insertBefore(wrapper, textToHighlight[0]);

        // Move all the nodes into the wrapper
        textToHighlight.forEach(node => {
            wrapper.appendChild(node);
        });

        // Scroll to the highlighted verse after a brief delay to ensure layout is complete
        setTimeout(() => {
            const rect = wrapper.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - 100; // 100px offset from top for nav ribbon

            // Custom smooth scroll with easing for very gentle motion
            const startY = scrollTop;
            const distance = targetY - startY;
            const duration = 1000; // 1 second scroll duration
            let startTime = null;

            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function scrollStep(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = easeInOutCubic(progress);

                window.scrollTo(0, startY + distance * ease);

                if (progress < 1) {
                    requestAnimationFrame(scrollStep);
                }
            }

            requestAnimationFrame(scrollStep);
        }, 300);

        // Start fading out the highlight after 1 second (will take 3.5s to fully fade)
        setTimeout(() => {
            wrapper.classList.add('verse-highlight-fadeout');
        }, 1000);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    highlightVerse();
});

// Also run when hash changes (for navigation within same page)
window.addEventListener('hashchange', () => {
    highlightVerse();
});

