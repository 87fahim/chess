import { render } from "@testing-library/react"; 
import ChessBoard from "../components/ChessBoard"; 
import { ChessBoardProvider } from "../context/ChessContext";
test("renders ChessBoard", () => { 
    const blankBoard = Array(8).fill([]).map(()=>Array(8).fill(""));
     render(
     <ChessBoardProvider
       state={{
         board: blankBoard,
         orientation: "white",
         freeStyle: false,
         showCoordinates: true,
         interactive: true,
         whitePieces: [],
         blackPieces: [],
         validMoves: [],
       }}
       actions={{
         onSquareClick: () => {},
         onDragStart: () => {},
         onDrop: () => {},
         onDropOutside: () => {},
       }}
     >
       <ChessBoard players={{}} />
     </ChessBoardProvider>
    ); 
    });
