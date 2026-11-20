# kotlinx.serialization: keep generated serializers for backup models
-keepclassmembers @kotlinx.serialization.Serializable class com.vu4ll.monedsa.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}
