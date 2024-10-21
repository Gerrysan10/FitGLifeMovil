import { StyleSheet, Text, View, Linking, ScrollView } from 'react-native';
import Title from '../components/Title';

const EmailLink = ({ email, subject, body }) => {
    const handleEmailLink = () => {
        const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        Linking.openURL(emailUrl).catch(err => Alert.alert('Error', 'No se pudo redirigir correctamente'));
    };

    return (
        <Text style={styles.gmail} onPress={handleEmailLink}>
            {email}.
        </Text>
    );
};

const PrivacityScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.conttitle}>
                <Title title={'Política de privacidad'} />
            </View>
            <ScrollView style={styles.conttext}>
                <Text style={styles.text}>
                    <Text style={styles.heading}>Última actualización: 30 de mayo de 2024</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        FitGlife ("nosotros", "nuestro" o "nos") se compromete a proteger la privacidad de nuestros usuarios ("usted" o "su"). Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos su información cuando utiliza nuestra aplicación móvil FitGlife (la "Aplicación").
                    </Text>{"\n\n"}
                    <Text style={styles.subheading}>1. Información que Recopilamos</Text>
                    <Text style={styles.subsubheading}>{"\n"}1.1. Información Personal{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Podemos recopilar la siguiente información personal cuando usted se registra o utiliza nuestra Aplicación:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Nombre y apellidos</Text>
                    <Text style={styles.listItem}>{"\n"}- Dirección de correo electrónico</Text>
                    <Text style={styles.listItem}>{"\n"}- Número de teléfono</Text>
                    <Text style={styles.listItem}>{"\n"}- Información del perfil de usuario, incluida su foto de perfil, edad, y género</Text>{"\n"}
                    <Text style={styles.subsubheading}>1.2. Información de Uso{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Recopilamos información sobre su interacción con la Aplicación, que puede incluir:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Datos de actividad física (por ejemplo, pasos, calorías quemadas, rutas de ejercicio)</Text>
                    <Text style={styles.listItem}>{"\n"}- Información sobre su dispositivo (modelo, sistema operativo, identificadores únicos)</Text>
                    <Text style={styles.listItem}>{"\n"}- Dirección IP</Text>
                    <Text style={styles.listItem}>{"\n"}- Tiempos de acceso y duración de las sesiones</Text>{"\n"}
                    <Text style={styles.subsubheading}>1.3. Información de Ubicación{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Podemos recopilar información sobre su ubicación geográfica precisa con su consentimiento para mejorar las funciones de la Aplicación, como el seguimiento de rutas de ejercicio.
                    </Text>{"\n\n"}
                    <Text style={styles.subheading}>2. Cómo Usamos Su Información{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Utilizamos la información recopilada para los siguientes propósitos:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Proveer y mejorar la funcionalidad de la Aplicación</Text>
                    <Text style={styles.listItem}>{"\n"}- Personalizar su experiencia de usuario</Text>
                    <Text style={styles.listItem}>{"\n"}- Comunicarnos con usted acerca de actualizaciones, ofertas y noticias relacionadas con la Aplicación</Text>
                    <Text style={styles.listItem}>{"\n"}- Analizar el uso de la Aplicación para desarrollar nuevas funciones y mejorar las existentes</Text>
                    <Text style={styles.listItem}>{"\n"}- Proporcionar soporte técnico y responder a sus consultas</Text>{"\n\n"}
                    <Text style={styles.subheading}>3. Compartición de Información{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        No compartimos su información personal con terceros, excepto en las siguientes circunstancias:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Con su consentimiento</Text>: Podemos compartir su información cuando tengamos su consentimiento expreso para hacerlo.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Proveedores de Servicios</Text>: Podemos compartir información con proveedores de servicios que nos ayuden a operar la Aplicación y realizar funciones en nuestro nombre, bajo estrictas obligaciones de confidencialidad.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Cumplimiento Legal</Text>: Podemos divulgar su información si es necesario para cumplir con una obligación legal, responder a solicitudes legales o proteger nuestros derechos y la seguridad de nuestros usuarios.</Text>{"\n\n"}
                    <Text style={styles.subheading}>4. Seguridad de la Información{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Implementamos medidas de seguridad razonables para proteger su información personal contra accesos no autorizados, uso indebido o divulgación. Sin embargo, ningún sistema de transmisión de datos por Internet o de almacenamiento electrónico es completamente seguro, por lo que no podemos garantizar una seguridad absoluta.
                    </Text>{"\n\n"}
                    <Text style={styles.subheading}>5. Sus Derechos{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Usted tiene los siguientes derechos con respecto a su información personal:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Acceso</Text>: Puede solicitar una copia de la información personal que tenemos sobre usted.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Corrección</Text>: Puede solicitar que corrijamos cualquier información personal inexacta.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Eliminación</Text>: Puede solicitar que eliminemos su información personal.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Restricción</Text>: Puede solicitar que restrinjamos el procesamiento de su información personal.</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Portabilidad</Text>: Puede solicitar que le proporcionemos su información personal en un formato estructurado, comúnmente utilizado y legible por máquina.</Text>
                    <Text style={styles.paragraph}>
                        Para ejercer estos derechos, por favor contáctenos a través de nuestro correo electrónico: soportefitglife@gmail.com.
                    </Text>{"\n\n"}
                    <Text style={styles.subheading}>6. Cambios en la Política de Privacidad{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización" en la parte superior. Le recomendamos revisar esta Política de Privacidad periódicamente para estar informado sobre cómo protegemos su información.
                    </Text>{"\n\n"}
                    <Text style={styles.subheading}>7. Contacto{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad, no dude en contactarnos a través del correo electronico:{"\n"}
                    </Text>
                    <EmailLink email="soportefitglife@gmail.com" subject="Consulta" body="Escribe tu mensaje aquí" />
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    conttitle: {
        marginTop: '10%',
        marginHorizontal: '4%',
    },
    conttext: {
        marginBottom: '10%',
        marginHorizontal: '4%',
    },
    text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        fontFamily: 'poppins400',
    },
    heading: {
        fontFamily: 'poppins600',
        fontSize: 18,
        marginBottom: 10,
    },
    subheading: {
        fontFamily: 'poppins600',
        fontSize: 17,
        marginTop: 20,
        marginBottom: 10,
    },
    subsubheading: {
        fontFamily: 'poppins600',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 5,
    },
    paragraph: {
        marginBottom: 10,
    },
    listItem: {
        marginBottom: 10,
    },
    bold: {
        fontFamily: 'poppins600',
    },
    gmail: {
        fontFamily: 'poppins500',
        fontSize: 16,
        color: '#026BD4',
        textDecorationLine: 'underline',
    },
});

export default PrivacityScreen;
