const fs = require('fs');
const path = require('path');

// [GET] /api/uploads/images - List all images in the uploads directory
const listImages = async (req, res) => {
    try {
        const uploadRoot = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');
        const roots = ['images', 'books'];
        
        let allImages = [];

        for (const rootName of roots) {
            const rootDir = path.join(uploadRoot, rootName);
            if (!fs.existsSync(rootDir)) continue;

            const scanDir = (dir, prefix) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        scanDir(fullPath, `${prefix}/${file}`);
                    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
                        const folderName = path.basename(dir);
                        allImages.push({
                            name: file,
                            url: `/uploads${prefix}/${file}`,
                            folder: prefix.includes('books') ? `Book ID: ${folderName}` : 'General'
                        });
                    }
                }
            };
            
            scanDir(rootDir, `/${rootName}`);
        }

        res.status(200).json({ success: true, data: allImages });
    } catch (error) {
        console.error("listImages Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    listImages
};