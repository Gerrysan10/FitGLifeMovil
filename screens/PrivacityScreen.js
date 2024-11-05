import { StyleSheet, Text, View, Linking, ScrollView, Alert } from 'react-native';
import Title from '../components/Title';

const EmailLink = ({ email, subject, body }) => {
    const handleEmailLink = () => {
        const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        Linking.openURL(emailUrl).catch(err => Alert.alert('Error', 'No se pudo redirigir correctamente'));
    };

    return (
        <Text style={styles.gmail} onPress={handleEmailLink}>
            {email}
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
                    <Text style={styles.heading}>Última actualización: 30 de septiembre de 2024</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        FitGLife, desarrollada por gera35san@gmail.com, se compromete a proteger la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información cuando utiliza nuestra aplicación móvil FitGLife.
                    </Text>{"\n\n"}
                    

                    <Text style={styles.subheading}>1. Información que Recopilamos</Text>
                    <Text style={styles.subsubheading}>{"\n\n"}1.1. Información Personal{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Recopilamos la siguiente información personal cuando usted se registra o utiliza nuestra Aplicación:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Nombre y apellidos</Text>
                    <Text style={styles.listItem}>{"\n"}- Dirección de correo electrónico</Text>
                    <Text style={styles.listItem}>{"\n"}- Información del perfil de usuario, incluida su foto de perfil (opcional) y télefono</Text>{"\n"}

                    <Text style={styles.subsubheading}>1.2. Datos de Medidas Corporales{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Con su consentimiento expreso, recopilamos las siguientes medidas corporales:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Peso</Text>
                    <Text style={styles.listItem}>{"\n"}- Altura</Text>
                    <Text style={styles.listItem}>{"\n"}- Medidas corporales específicas (como circunferencia de cintura, cadera, etc.)</Text>{"\n\n"}

                    <Text style={styles.subheading}>2. Cómo Usamos Su Información{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Utilizamos la información recopilada únicamente para:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Crear y mantener su perfil de usuario</Text>
                    <Text style={styles.listItem}>{"\n"}- Permitirle registrar y dar seguimiento a sus medidas corporales</Text>
                    <Text style={styles.listItem}>{"\n"}- Personalizar su experiencia dentro de la aplicación</Text>
                    <Text style={styles.listItem}>{"\n"}- Proporcionar soporte técnico cuando lo solicite</Text>{"\n\n"}

                    <Text style={styles.subheading}>3. Protección de su Información{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Consideramos sus datos de medidas corporales como información sensible de salud y aplicamos medidas de seguridad específicas para protegerlos. No compartimos esta información con terceros sin su consentimiento explícito, excepto cuando sea requerido por ley.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>4. Sus Derechos{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Usted tiene los siguientes derechos sobre sus datos personales:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Acceso</Text>: Solicitar una copia de sus datos personales</Text>
                    <Text style={styles.listItem}>{"\n"}- <Text style={styles.bold}>Eliminación</Text>: Solicitar la eliminación de sus datos</Text>{"\n\n"}

                    <Text style={styles.subheading}>5. Conservación de Datos{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Mantendremos sus datos personales y medidas corporales mientras su cuenta permanezca activa. Puede solicitar la eliminación de su cuenta y sus datos en cualquier momento.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>6. Cambios en la Política de Privacidad{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cualquier cambio significativo a través de la aplicación y actualizando la fecha en la parte superior de esta política.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>7. Contacto{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, contáctenos en:{"\n"}
                    </Text>
                    <EmailLink email="gera35san@gmail.com" subject="Consulta de Privacidad" body="Escriba su mensaje aquí" />{"\n\n"}
                    <Text style={styles.heading}>Términos y Condiciones</Text>{"\n\n"}

                    <Text style={styles.paragraph}>
                        Al descargar, instalar o usar la aplicación FitGLife, usted acepta estar sujeto a estos Términos y Condiciones.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>1. Uso de la Aplicación</Text>{"\n\n"}
                    <Text style={styles.subsubheading}>1.1. Propósito de la Aplicación{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        FitGLife es una aplicación diseñada para el registro y seguimiento de medidas corporales con fines de bienestar personal.
                    </Text>{"\n"}
                    
                    <Text style={styles.subsubheading}>1.2. Requisitos de Edad{"\n"}</Text>
                    <Text style={styles.paragraph}>
                        Usted debe ser mayor de 18 años para usar esta aplicación. Si es menor de edad, necesita el consentimiento de sus padres o tutores legales.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>2. Cuenta de Usuario</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Para utilizar la aplicación, debe cumplir con los siguientes requisitos:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Crear una cuenta con información precisa y actualizada</Text>
                    <Text style={styles.listItem}>{"\n"}- Mantener la seguridad de su cuenta y contraseña</Text>
                    <Text style={styles.listItem}>{"\n"}- Aceptar que podemos suspender o terminar su cuenta por violación de términos</Text>{"\n\n"}

                    <Text style={styles.subheading}>3. Uso Aceptable</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Al utilizar nuestra aplicación, usted se compromete a no:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Usar la aplicación para fines ilegales</Text>
                    <Text style={styles.listItem}>{"\n"}- Intentar acceder sin autorización a la aplicación</Text>
                    <Text style={styles.listItem}>{"\n"}- Interferir con el funcionamiento de la aplicación</Text>{"\n\n"}

                    <Text style={styles.subheading}>4. Propiedad Intelectual</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Todos los derechos de propiedad intelectual relacionados con la aplicación están protegidos:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- La aplicación y su contenido están protegidos por derechos de autor</Text>
                    <Text style={styles.listItem}>{"\n"}- No está permitida la copia, modificación o distribución sin autorización</Text>{"\n\n"}

                    <Text style={styles.subheading}>5. Limitación de Responsabilidad</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Es importante que entienda nuestras limitaciones de responsabilidad:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- La aplicación se proporciona "tal cual" sin garantías</Text>
                    <Text style={styles.listItem}>{"\n"}- No nos responsabilizamos por decisiones basadas en los datos registrados</Text>
                    <Text style={styles.listItem}>{"\n"}- Recomendamos consultar con profesionales de la salud para decisiones sobre su bienestar</Text>{"\n\n"}

                    <Text style={styles.subheading}>6. Modificaciones</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Nos reservamos el derecho de realizar cambios:
                    </Text>
                    <Text style={styles.listItem}>{"\n"}- Podemos modificar estos términos en cualquier momento</Text>
                    <Text style={styles.listItem}>{"\n"}- Los cambios entran en vigor inmediatamente después de su publicación</Text>{"\n\n"}

                    <Text style={styles.subheading}>7. Ley Aplicable</Text>{"\n\n"}
                    <Text style={styles.paragraph}>
                        Estos términos se rigen por las leyes de México.
                    </Text>{"\n\n"}

                    <Text style={styles.subheading}>8. Contacto</Text>{"\n"}
                    <Text style={styles.paragraph}>
                        Para cualquier consulta sobre estos términos, contáctenos en:{"\n"}
                    </Text>
                    <EmailLink email="soportefitglife@gmail.com" subject="Consulta sobre Términos y Condiciones" body="Escriba su mensaje aquí" />
                </Text>
                
            </ScrollView>
        </View>
    );
};

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