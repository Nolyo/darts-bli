import Game from "../../entities/game";
import {Text, View} from "../Themed";
import styles from "../../constants/Css";

const CardHeader = (props: { game: Game }) => {
    return <View style={styles.card}>
        <Text style={{...styles.cardText, fontWeight: "bold"}}>{props.game.currentPlayer()?.name}</Text>
        <Text style={styles.cardText}>{props.game.currentPlayer()?.getScore()} Pts</Text>
        <Text style={styles.cardText}>{3 - props.game.getCurrentPlayerInRow().getDartsCount()} tirs</Text>
    </View>;
}

export default CardHeader;