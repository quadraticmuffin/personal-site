// adapted from the java implementation at https://www.programiz.com/dsa/red-black-tree

class Mod {
    constructor(field, version, value) {
        this.field = field; // Field name as a string
        this.version = version; // Version number as an integer
        this.value = value; // Value can be of any type
    }
}

class Node {
    constructor(data, color = 1, parent = null, left = null, right = null) {
        this.data = data;
        this.color = color; // 1 for red, 0 for black
        this.parent = parent;
        this.left = left;
        this.right = right;
    }
}

class RedBlackTree {
    constructor(key, color, left, right, parent) {
        this.key = key;          // Key for the node
        this.color = color;      // Color of the node: 'red' or 'black'

        this.left = left;        // Left child
        this.right = right;       // Right child
        this.parent = parent;      // Parent

        this.back_left = null;
        this.back_right = null;
        this.back_parent = null;

        this.maxMods = 6;
        this.mods = Array();

        this.TNULL = new Node(null, 0); // Sentinel node
        this.root = this.TNULL;
    }

    read(field, version=undefined) {
        for (let i = this.mods.length - 1; i >= 0; i--) {
            const mod = this.mods[i];
            if (mod.field === field && (version === undefined || mod.version <= version)) {
                return mod.value;
            }
        }
        return this[field];
    }

    write(field, version, value) {
        if (this.mods.length < this.maxMods) {
            this.mods.push(new Mod(field, version, value));
            return;
        }
        else {
            new_node = new RedBlackNode(
                this.read('key'), 
                this.read('color'), 
                this.read('left'), 
                this.read('right'), 
                this.read('parent')
            );
            new_node.back_left = this.back_left;
            new_node.back_right = this.back_right;
            new_node.back_parent = this.back_parent;

            new_node.left.back_left = new_node;
            new_node.right.back_right = new_node;
            new_node.parent.back_parent = new_node;

            new_node.back_left.write('left', version, new_node);
            new_node.back_right.write('right', version, new_node);    
            new_node.back_parent.write('parent', version, new_node);
        }
    }

    // Preorder traversal
    preOrderHelper(node) {
        if (node !== this.TNULL) {
            process.stdout.write(node.data + " ");
            this.preOrderHelper(node.left);
            this.preOrderHelper(node.right);
        }
    }

    // Inorder traversal
    inOrderHelper(node) {
        if (node !== this.TNULL) {
            this.inOrderHelper(node.left);
            process.stdout.write(node.data + " ");
            this.inOrderHelper(node.right);
        }
    }

    // Postorder traversal
    postOrderHelper(node) {
        if (node !== this.TNULL) {
            this.postOrderHelper(node.left);
            this.postOrderHelper(node.right);
            process.stdout.write(node.data + " ");
        }
    }

    // Search the tree
    searchTreeHelper(node, key) {
        if (node === this.TNULL || key === node.data) {
            return node;
        }
        if (key < node.data) {
            return this.searchTreeHelper(node.left, key);
        }
        return this.searchTreeHelper(node.right, key);
    }

    // Balance the tree after deletion
    fixDelete(x) {
        while (x !== this.root && x.color === 0) {
            if (x === x.parent.left) {
                let s = x.parent.right;
                if (s.color === 1) {
                    s.color = 0;
                    x.parent.color = 1;
                    this.leftRotate(x.parent);
                    s = x.parent.right;
                }
                if (s.left.color === 0 && s.right.color === 0) {
                    s.color = 1;
                    x = x.parent;
                } else {
                    if (s.right.color === 0) {
                        s.left.color = 0;
                        s.color = 1;
                        this.rightRotate(s);
                        s = x.parent.right;
                    }
                    s.color = x.parent.color;
                    x.parent.color = 0;
                    s.right.color = 0;
                    this.leftRotate(x.parent);
                    x = this.root;
                }
            } else {
                let s = x.parent.left;
                if (s.color === 1) {
                    s.color = 0;
                    x.parent.color = 1;
                    this.rightRotate(x.parent);
                    s = x.parent.left;
                }
                if (s.right.color === 0 && s.left.color === 0) {
                    s.color = 1;
                    x = x.parent;
                } else {
                    if (s.left.color === 0) {
                        s.right.color = 0;
                        s.color = 1;
                        this.leftRotate(s);
                        s = x.parent.left;
                    }
                    s.color = x.parent.color;
                    x.parent.color = 0;
                    s.left.color = 0;
                    this.rightRotate(x.parent);
                    x = this.root;
                }
            }
        }
        x.color = 0;
    }

    // Rotate left
    leftRotate(x) {
        let y = x.right;
        x.right = y.left;
        if (y.left !== this.TNULL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }

    // Rotate right
    rightRotate(x) {
        let y = x.left;
        x.left = y.right;
        if (y.right !== this.TNULL) {
            y.right.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }
        y.right = x;
        x.parent = y;
    }

    // Insert a new node
    insert(key) {
        let node = new Node(key, 1, null, this.TNULL, this.TNULL);

        let y = null;
        let x = this.root;

        while (x !== this.TNULL) {
            y = x;
            if (node.data < x.data) {
                x = x.left;
            } else {
                x = x.right;
            }
        }

        node.parent = y;
        if (y === null) {
            this.root = node;
        } else if (node.data < y.data) {
            y.left = node;
        } else {
            y.right = node;
        }

        if (node.parent === null) {
            node.color = 0;
            return;
        }

        if (node.parent.parent === null) {
            return;
        }

        this.fixInsert(node);
    }

    // Balance the tree after insertion
    fixInsert(k) {
        while (k.parent.color === 1) {
            if (k.parent === k.parent.parent.right) {
                let u = k.parent.parent.left;
                if (u.color === 1) {
                    u.color = 0;
                    k.parent.color = 0;
                    k.parent.parent.color = 1;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rightRotate(k);
                    }
                    k.parent.color = 0;
                    k.parent.parent.color = 1;
                    this.leftRotate(k.parent.parent);
                }
            } else {
                let u = k.parent.parent.right;
                if (u.color === 1) {
                    u.color = 0;
                    k.parent.color = 0;
                    k.parent.parent.color = 1;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.leftRotate(k);
                    }
                    k.parent.color = 0;
                    k.parent.parent.color = 1;
                    this.rightRotate(k.parent.parent);
                }
            }
            if (k === this.root) {
                break;
            }
        }
        this.root.color = 0;
    }

    // Print the tree structure
    printHelper(node, indent, last) {
        if (node !== this.TNULL) {
            console.log(indent + (last ? "R---- " : "L---- ") + node.data + (node.color === 1 ? "(RED)" : "(BLACK)"));
            this.printHelper(node.left, indent + (last ? "   " : "|  "), false);
            this.printHelper(node.right, indent + (last ? "   " : "|  "), true);
        }
    }

    // Print the tree
    printTree() {
        this.printHelper(this.root, "", true);
    }
}
    

    
// Hard-coded Red-Black Tree
// Example Usage
const exampleRedBlackTree = new RedBlackTree();
exampleRedBlackTree.insert(55);
exampleRedBlackTree.insert(40);
exampleRedBlackTree.insert(65);
exampleRedBlackTree.insert(60);
exampleRedBlackTree.insert(75);
exampleRedBlackTree.insert(57);

// Function to visualize the tree on the canvas
function drawTree(canvasId, tree) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Simple visualization logic (you can enhance this)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    function drawTreeInner(node, x, y, prev_x) {
        ctx.fillStyle = (node.color === 1 ? "RED" : "BLACK");
        const dx = Math.abs((x - prev_x) / 2);
        ctx.fillText(node.data, x, y);
        if (node.left) {
            drawTreeInner(node.left, x - dx, y + 30, x);
        }
        if (node.right) {
            drawTreeInner(node.right, x + dx, y + 30, x);
        }
    }

    drawTreeInner(tree.root, canvas.width / 2, 60, 0);
}

// Exporting the RedBlackTree class
export default RedBlackTree;
export { drawTree, exampleRedBlackTree}; 