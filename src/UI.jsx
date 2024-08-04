import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, point) {
    return { name, point };
  }

const rows = [
    createData('1의 합', ''),
    createData('2의 합', ''),
    createData('3의 합', ''),
    createData('4의 합', ''),
    createData('6의 합', ''),
    createData('보너스', ''),
    createData('스몰 스트레이트', ''),
    createData('라지 스트레이트', ''),
    createData('풀 하우스', ''),
    createData('!! 야찌 !!', ''),
  ];

export default function BasicButtons() {

    const handleRoll = () => {
        const game = window.PhaserGame
        if (game) {
            game.scene.scenes[0].rollDice();
        }
    }



  return (
    <div>
    <div style={{position: "absolute", top: "6.5%", left: "60%"}}>
      <Button variant="contained" onClick={handleRoll}>다시굴리기</Button>
    </div>

    <TableContainer component={Paper} sx={{}}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">내 점수</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.point}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </div>
  );
}