// import { useState } from "react";

// const DraggableModal = ({ children, onClose }) => {
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [dragging, setDragging] = useState(false);
//   const [start, setStart] = useState({ x: 0, y: 0 });

//   const handleMouseDown = (e) => {
//     setDragging(true);
//     setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
//   };

//   const handleMouseMove = (e) => {
//     if (!dragging) return;
//     setPosition({ x: e.clientX - start.x, y: e.clientY - start.y });
//   };

//   const handleMouseUp = () => {
//     setDragging(false);
//   };

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-50"
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//     >
//       <div
//         className="bg-gray-900 p-8 rounded-2xl max-w-2xl w-full border border-violet-900 cursor-move"
//         style={{ transform: `translate(${position.x}px, ${position.y}px)`, position: "absolute" }}
//         onMouseDown={handleMouseDown}
//       >
//         {/* <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
//           Notes
//         </h2> */}
//         {children}
//         <div className="mt-4 flex justify-end gap-4">
//           {/* <button
//             className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
//             onClick={onClose}
//           >
//             Close
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DraggableModal;
