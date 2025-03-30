# PDF Annotator Save State

Current Issues
Annotations misplacement in downloaded PDF
Scale inconsistency between viewer and saved PDF
Need to properly match PDF viewport dimensions
Last Working State
SaveProgress component working correctly
Canvas layering system functional
Annotations store working per page
Pending Fixes
Scale calculations in PDFSaver.ts need to match PDFViewer scale
Proper coordinate transformation between annotation and PDF coordinates
High-resolution rendering for better quality annotations
Fix viewport and annotation scaling ratio
Implementation Notes
Need to maintain consistent scale between creation and saving
Consider Retina display support for high-DPI screens
Review annotation coordinate system in AnnotationLayer
Next Steps
Update scale calculations to match viewer and saver
Fix coordinate transformation
Improve rendering quality
Test on various PDF sizes and resolutions
