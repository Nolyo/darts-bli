import { StyleSheet } from 'react-native';
import { Container, Text, Title, View } from '../../components/Themed';
import Separator from '../../components/Separator';
import ButtonLink from '../../components/ButtonLink';

export default function TabOneScreen() {
  return (
    <Container>
      <Title>Dart's Bli</Title>
      <Separator />
      <ButtonLink href='/game/new'>
        Nouvelle partie
      </ButtonLink>
      <Separator />
      <ButtonLink href='/game/new'>
        Chercher une partie
      </ButtonLink>
    </Container>
  );
}
