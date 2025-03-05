# ProyectoIntegradorLabll
 ULP

Práctico Integrador Laboratorio 2


La aplicación “Atención Médica” consiste en una aplicación para que el médico profesional pueda consultar su agenda en la institución además de poder gestionar la información de la historia clínica de sus pacientes.

El profesional accede con su usuario y puede consultar la información de su agenda diaria. Al comienzo vera los turnos para el día actual, pero si es necesario puede consultar los turnos de otros días. En la información de su agenda verá quienes son los pacientes que debe atender y el estado de cada horario.

La agenda debe facilitar al profesional cual es el paciente que tienen que atender, visualizando el motivo de la consulta y pudiendo acceder rápidamente al historial de atenciones que tuvo ese paciente con el profesional.
En ese historial debe mostrarse fecha de atención, motivo de consulta, diagnóstico, evolución (resumen que detalla el profesional en cada atención que realiza a un paciente), Alergias, Antecedentes patológicos, Hábitos y Medicamentos en uso.

La aplicación debe permitir seleccionar al paciente para iniciar la atención de la consulta, en este momento el estado del horario pasará a atendido. Al iniciar la consulta se debe abrir la historia clínica del paciente para que el profesional pueda visualizarla. Además, el profesional deberá registrar los datos de la atención actual.

Historia Clínica Electrónica (HCE)

La HCE debe reflejar la información de todas las atenciones que tuvo el paciente en esa institución.
La HCE consta de:

•	Evoluciones (o notas clínicas) donde el médico describe un resumen de la atención. La evolución debe poder escribirse en una interfaz de texto enriquecido para que el médico pueda darle un formato adecuado a la evolución.
•	Diagnósticos de cada atención. Que pueden ser preliminares o confirmados. Puede existir mas de un diagnóstico por atención. Los diagnósticos serán campos de texto libre. Es Obligatorio que exista un diagnóstico por atención.
•	Alergias, pueden ser registradas opcionalmente en cualquier atención. Constan de un nombre, importancia (leve, normal, alta), fecha desde y hasta. Las alergias deben estar nomencladas.
•	Antecedentes patológicos, pueden ser registrados opcionalmente en cualquier atención. Son de texto libre y deben incluir una fecha desde y hasta.
•	Hábitos, pueden ser registrados opcionalmente en cualquier atención. Son de texto libre y deben incluir una fecha desde y hasta.
•	Medicamentos en uso, pueden ser registrados opcionalmente y serán de texto libre.

Todos los registros de atenciones anteriores no podrán ser modificados. Solo los registros pertenecientes a la última atención del paciente.

Al momento de consultar la HCE el profesional puede ver algunos datos de las atenciones que tuvo el paciente con otros profesionales. En estos casos solo podrá ver la fecha en que se atendió el paciente, con quién se atendió, el motivo de consulta y el diagnóstico. Los demás datos de la HCE solo podrán ser observados por el médico que lo registro.

Una vez que el profesional ha terminado de atender al paciente, este debe cerrar la consulta actual para que esta información impacte en el estado de la agenda. Para poder cerrar la consulta actual el sistema debe corroborar que el paciente tenga registrado un diagnóstico y una evolución en la consulta, sino no podrá cerrar la atención.

Sobre las evoluciones

El sistema debe proveer una funcionabilidad que permita al médico cargar templates de notas clínicas. Estos templates pueden ser llamados (cargados) al momento de crear una nueva evolución para facilitar la escritura de las notas clínicas.

Sobre la agenda del Profesional

Este TPI no debe cubrir la gestión de la agenda del profesional, aunque si es necesario que se simule la disponibilidad de tal agenda para comenzar los flujos de trabajo.
-----------------------------------------------------------------------------------
Enunciado del Trabajo Práctico Integrador.

El proyecto puede realizarse individual o de a 2 integrantes. En caso de que al comienzo sean 2 integrantes y luego se separen no pueden ser reemplazados los integrantes.

El proyecto se defiende al final de la cursada o en mesa de examen para aprobar la materia.

Para regularizar la materia se deberá tener en funcionamiento (al final de la cursada):

Pantalla para consultar la agenda del día del médico.
Poder selecciona un paciente y consultar su historia clínica
Poder cargar la evolución de un paciente.
Estas funcionabilidades deberán estar subidas a un servidor (en internet).

Si el tiempo lo permite cabe la posibilidad que estas funciones tengan que ser presentadas en clase (la última semana)