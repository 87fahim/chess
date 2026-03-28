import { render } from "@testing-library/react"; 
import ChessBoard from "../components/ChessBoard"; 
test("renders ChessBoard", () => { 
    const blankBoard = Array(8).fill([]).map(()=>Array(8).fill(""));
     render(
     <ChessBoard 
       board={blankBoard} 
       orientation="white" 
       freeStyle={false}
       onSquareClick={()=>{}} 
       whitePieces={[]} 
       blackPieces={[]} 
       onDragStart={() => {}} 
       onDrop={() => {}} 
       onDropOutside={() => {}} 
     />
    ); 
    });
