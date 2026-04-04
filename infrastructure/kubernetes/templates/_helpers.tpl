{{/*
Helpers for FinovaBank Kubernetes templates
*/}}

{{/* Define the base name for resources - must be defined first */}}
{{- define "finovabank.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Create a default fully qualified app name */}}
{{- define "finovabank.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Create chart name and version as used by the chart label */}}
{{- define "finovabank.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Common labels */}}
{{- define "finovabank.labels" -}}
helm.sh/chart: {{ include "finovabank.chart" . }}
{{ include "finovabank.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Selector labels */}}
{{- define "finovabank.selectorLabels" -}}
app.kubernetes.io/name: {{ include "finovabank.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Create the name of the service account to use */}}
{{- define "finovabank.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "finovabank.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/* Define environment variables */}}
{{- define "finovabank.env" -}}
- name: API_BASE_URL
  value: {{ .Values.environment.API_BASE_URL | quote }}
- name: SPRING_PROFILES_ACTIVE
  value: {{ .Values.environment.springProfile | default "production" | quote }}
{{- if .Values.environment.extra }}
{{- range $key, $value := .Values.environment.extra }}
- name: {{ $key }}
  value: {{ $value | quote }}
{{- end }}
{{- end }}
{{- end -}}

{{/* Generate image reference */}}
{{- define "finovabank.image" -}}
{{- $svc := . -}}
{{- printf "%s/%s:%s" $svc.repository $svc.name ($svc.tag | default "latest") -}}
{{- end -}}

{{/* Return only enabled services as a YAML-serialised map for fromYaml consumption */}}
{{- define "finovabank.enabledServices" -}}
{{- $result := dict -}}
{{- range $name, $svc := .Values.services -}}
{{- if $svc.enabled -}}
{{- $_ := set $result $name $svc -}}
{{- end -}}
{{- end -}}
{{- $result | toYaml -}}
{{- end -}}

{{/* Return services eligible for HPA (autoscaling enabled + service enabled + replicaCount > 1) */}}
{{- define "finovabank.hpaEligibleServices" -}}
{{- $result := dict -}}
{{- if .Values.autoscaling.enabled -}}
{{- range $name, $svc := .Values.services -}}
{{- if and $svc.enabled (gt ($svc.replicaCount | default 1 | int) 1) -}}
{{- $_ := set $result $name $svc -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- $result | toYaml -}}
{{- end -}}

{{/* Generate all Deployment documents */}}
{{- define "finovabank.allDeployments" -}}
{{- range $serviceName, $serviceValues := .Values.services }}
{{- if $serviceValues.enabled }}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "finovabank.fullname" $ }}-{{ $serviceName }}
  labels:
    {{- include "finovabank.labels" $ | nindent 4 }}
    app.kubernetes.io/component: {{ $serviceName }}
spec:
  replicas: {{ $serviceValues.replicaCount | default 1 }}
  selector:
    matchLabels:
      {{- include "finovabank.selectorLabels" $ | nindent 6 }}
      app.kubernetes.io/component: {{ $serviceName }}
  template:
    metadata:
      labels:
        {{- include "finovabank.selectorLabels" $ | nindent 8 }}
        app.kubernetes.io/component: {{ $serviceName }}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: {{ $serviceValues.port | quote }}
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: {{ include "finovabank.serviceAccountName" $ }}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: {{ $serviceName }}
          image: "{{ $.Values.image.repository }}:{{ $serviceValues.tag | default $.Values.image.tag | default "latest" }}"
          imagePullPolicy: {{ $.Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ $serviceValues.port }}
              protocol: TCP
          env:
            {{- include "finovabank.env" $ | nindent 12 }}
          envFrom:
            - secretRef:
                name: finovabank-secrets
          {{- if $serviceValues.probes.enabled }}
          readinessProbe:
            httpGet:
              path: {{ $serviceValues.probes.path | default "/actuator/health" }}
              port: {{ $serviceValues.probes.port | default $serviceValues.port }}
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: {{ $serviceValues.probes.path | default "/actuator/health" }}
              port: {{ $serviceValues.probes.port | default $serviceValues.port }}
            initialDelaySeconds: 60
            periodSeconds: 20
            failureThreshold: 3
          {{- end }}
          resources:
            {{- toYaml $.Values.resources | nindent 12 }}
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
{{- end }}
{{- end }}
{{- end }}

{{/* Generate all Service documents */}}
{{- define "finovabank.allServices" -}}
{{- range $serviceName, $serviceValues := .Values.services }}
{{- if $serviceValues.enabled }}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "finovabank.fullname" $ }}-{{ $serviceName }}
  labels:
    {{- include "finovabank.labels" $ | nindent 4 }}
    app.kubernetes.io/component: {{ $serviceName }}
spec:
  type: {{ $.Values.service.type }}
  selector:
    {{- include "finovabank.selectorLabels" $ | nindent 4 }}
    app.kubernetes.io/component: {{ $serviceName }}
  ports:
    - name: http
      port: {{ $serviceValues.port }}
      targetPort: http
      protocol: TCP
{{- end }}
{{- end }}
{{- end }}

{{/* Generate all HorizontalPodAutoscaler documents */}}
{{- define "finovabank.allHPAs" -}}
{{- if .Values.autoscaling.enabled }}
{{- range $serviceName, $serviceValues := .Values.services }}
{{- if and $serviceValues.enabled (gt ($serviceValues.replicaCount | default 1 | int) 1) }}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "finovabank.fullname" $ }}-{{ $serviceName }}
  labels:
    {{- include "finovabank.labels" $ | nindent 4 }}
    app.kubernetes.io/component: {{ $serviceName }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "finovabank.fullname" $ }}-{{ $serviceName }}
  minReplicas: {{ $.Values.autoscaling.minReplicas }}
  maxReplicas: {{ $.Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ $.Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ $.Values.autoscaling.targetMemoryUtilizationPercentage }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
