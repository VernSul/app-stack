import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_google_map.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart' as g_maps;
import 'search_model.dart';


class SearchWidget extends StatefulWidget {
  const SearchWidget({super.key, this.addModelFn});

  final Function(FlutterFlowModel)? addModelFn;

  @override
  State<SearchWidget> createState() => _SearchWidgetState();
}

class _SearchWidgetState extends State<SearchWidget> with RouteAware {
  late SearchModel _model;
  late GoogleMapController mapController;

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  final scaffoldKey = GlobalKey<ScaffoldState>();
  LatLng? currentUserLocationValue;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SearchModel());

    logFirebaseEvent('screen_view', parameters: {'screen_name': 'Search'});

    getCurrentUserLocation(defaultLocation: LatLng(0.0, 0.0), cached: true)
        .then((loc) => safeSetState(() => currentUserLocationValue = loc));
    _model.textQueryTextController ??= TextEditingController()
      ..addListener(() {
        debugLogWidgetClass(_model.rootModel);
      });
    _model.textQueryFocusNode ??= FocusNode();
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(this, DebugModalRoute.of(context)!);
    debugLogGlobalProperty(context);
  }

  @override
  void didPopNext() {
    safeSetState(() => _model.isRouteVisible = true);
    debugLogWidgetClass(_model);
  }

  @override
  void didPush() {
    safeSetState(() => _model.isRouteVisible = true);
    debugLogWidgetClass(_model);
  }

  @override
  void didPop() {
    _model.isRouteVisible = false;
  }

  @override
  void didPushNext() {
    _model.isRouteVisible = false;
  }

g_maps.LatLng getMapLocation() {
    if (FFAppState().locations.isNotEmpty) {
      return g_maps.LatLng(
                        FFAppState().locations[0].latitude, 
                        FFAppState().locations[0].longitude);
    } else {
      return g_maps.LatLng(currentUserLocationValue!.latitude, currentUserLocationValue!.longitude);
    }
  }
 



  @override
  Widget build(BuildContext context) {
    widget.addModelFn?.call(_model);
    context.watch<FFAppState>();


    if (currentUserLocationValue == null) {
      return Container(
        color: FlutterFlowTheme.of(context).primaryBackground,
        child: Center(
          child: SizedBox(
            width: 50.0,
            height: 50.0,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(
                FlutterFlowTheme.of(context).primary,
              ),
            ),
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        key: scaffoldKey,
        resizeToAvoidBottomInset: false,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        appBar: AppBar(
          backgroundColor: Color(0x00FFFFFF),
          automaticallyImplyLeading: false,
          title: Text(
            'Spots Finder',
            style: FlutterFlowTheme.of(context).headlineMedium.override(
                  fontFamily: 'Urbanist',
                  color: Colors.white,
                  fontSize: 22.0,
                  letterSpacing: 0.0,
                ),
          ),
          actions: [],
          centerTitle: false,
          elevation: 2.0,
        ),
        body: SafeArea(
          top: true,
          child: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
                child: TextFormField(
                  controller: _model.textQueryTextController,
                  focusNode: _model.textQueryFocusNode,
                  onChanged: (_) => EasyDebounce.debounce(
                    '_model.textQueryTextController',
                    Duration(milliseconds: 2000),
                    () async {
                      logFirebaseEvent('SEARCH_textQuery_ON_TEXTFIELD_CHANGE');
                      logFirebaseEvent('textQuery_update_app_state');
                      FFAppState().textQuery =
                          _model.textQueryTextController.text;
                    },
                  ),
                  autofocus: true,
                  obscureText: false,
                  decoration: InputDecoration(
                    labelText: 'Search for your next outing spot...',
                    labelStyle:
                        FlutterFlowTheme.of(context).labelMedium.override(
                              fontFamily: 'Manrope',
                              letterSpacing: 0.0,
                            ),
                    hintStyle:
                        FlutterFlowTheme.of(context).labelMedium.override(
                              fontFamily: 'Manrope',
                              letterSpacing: 0.0,
                            ),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).alternate,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).primary,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    errorBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    focusedErrorBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily: 'Manrope',
                        letterSpacing: 0.0,
                      ),
                  maxLines: 10,
                  minLines: 1,
                  validator: _model.textQueryTextControllerValidator
                      .asValidator(context),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(0.0, -1.0),
                child: FFButtonWidget(
                  onPressed: () async {
                    logFirebaseEvent('SEARCH_PAGE_Search_ON_TAP');
                    logFirebaseEvent('Search_backend_call');
                    _model.apiResult575 = await SpotSearchCall.call(
                      query: FFAppState().textQuery,
                    );

                    if ((_model.apiResult575?.succeeded ?? true)) {
                      logFirebaseEvent('Search_update_app_state');
                      FFAppState().spotsFound =
                          SpotsFoundStruct.maybeFromMap(getJsonField(
                        (_model.apiResult575?.jsonBody ?? ''),
                        r'''$''',
                      ))!;
                      safeSetState(() {});
                      logFirebaseEvent('Search_update_app_state');
                      FFAppState().locations = functions
                          .parseLatLngListFromJson((getJsonField(
                            FFAppState().spotsFound.toMap(),
                            r'''$.locations''',
                            true,
                          )!
                                  .toList()
                                  .map<JsonLatLtgStruct?>(
                                      JsonLatLtgStruct.maybeFromMap)
                                  .toList() as Iterable<JsonLatLtgStruct?>)
                              .withoutNulls
                              .toList())
                          .toList()
                          .cast<LatLng>();
                      safeSetState(() {});
                    }

                    safeSetState(() {});
                  },
                  text: 'Search',
                  options: FFButtonOptions(
                    height: 40.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 0.0),
                    iconPadding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: FlutterFlowTheme.of(context).primary,
                    textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                          fontFamily: 'Manrope',
                          color: Colors.white,
                          letterSpacing: 0.0,
                        ),
                    elevation: 3.0,
                    borderSide: BorderSide(
                      color: Colors.transparent,
                      width: 1.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),
              Expanded(
                child: GoogleMap(
                  onMapCreated: _onMapCreated,
                  myLocationEnabled: true,
                  initialCameraPosition:
                    CameraPosition(
                      target: getMapLocation(),
                      zoom: 12
                      ),
                      markers: FFAppState()
                      .spotsFound.spots
                      .map(
                        (marker) => Marker(
                          markerId: MarkerId(marker.name),
                          infoWindow: InfoWindow(
                            title: "${marker.name}",
                            snippet: "${marker.address}"),
                          position: g_maps.LatLng(marker.geoloc.lat,
                          marker.geoloc.lng),
                      ),
                      )
                      .toSet(),
                )
                // FlutterFlowGoogleMap(
                //   controller: _model.googleMapsController,
                //   onCameraIdle: (latLng) => _model.googleMapsCenter = latLng,
                //   initialLocation: _model.googleMapsCenter ??=
                //       currentUserLocationValue!,
                //   markers: FFAppState()
                //       .locations
                //       .map(
                //         (marker) => FlutterFlowMarker(
                //           marker.serialize(),
                //           marker,
                //         ),
                //       )
                //       .toList(),
                //   markerColor: GoogleMarkerColor.violet,
                //   mapType: MapType.terrain,
                //   style: GoogleMapStyle.standard,
                //   initialZoom: 14.0,
                //   allowInteraction: true,
                //   allowZoom: true,
                //   showZoomControls: true,
                //   showLocation: true,
                //   showCompass: false,
                //   showMapToolbar: false,
                //   showTraffic: false,
                //   centerMapOnMarkerTap: true,
                // ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

